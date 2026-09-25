from __future__ import annotations

import uuid
from collections import defaultdict
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.modules.market_validation.analysis.models import ConsumerPlanningBaseline
from app.modules.market_validation.participants.models import MarketParticipant
from app.modules.market_validation.analysis.schemas import (
    BaselineCreate,
    ProblemAnalysisResponse,
    ProblemAnalysisItem,
    JTBDAnalysisResponse,
    JTBDAnalysisItem,
    JourneyAnalysisResponse,
    JourneyStageAnalysisItem,
    SegmentAnalysisResponse,
    SegmentAnalysisItem,
    WorkflowFragmentationResponse,
    ResearchDashboardSummary,
)
from app.modules.market_validation.analysis.repository import AnalysisRepository
from app.modules.market_validation.jobs.service import JTBDService


class AnalysisService:
    def __init__(self, repo: AnalysisRepository | None = None):
        self.repo = repo or AnalysisRepository()
        self.jtbd_service = JTBDService()

    def record_baseline(self, db: Session, payload: BaselineCreate) -> ConsumerPlanningBaseline:
        participant = db.get(MarketParticipant, payload.participant_id)
        if not participant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Participant {payload.participant_id} not found.",
            )

        frag_score = len(payload.tools_used)

        baseline = ConsumerPlanningBaseline(
            id=uuid.uuid4(),
            participant_id=payload.participant_id,
            task_id=payload.task_id,
            completion_status=payload.completion_status,
            duration_seconds=payload.duration_seconds,
            tools_used=payload.tools_used,
            searches_count=payload.searches_count,
            manual_steps=payload.manual_steps,
            unresolved_questions=payload.unresolved_questions,
            confidence_score=payload.confidence_score,
            researcher_notes=payload.researcher_notes,
            workflow_fragmentation_score=frag_score,
        )
        return self.repo.create_baseline(db, baseline)

    def analyze_problems(self, db: Session) -> ProblemAnalysisResponse:
        problems = self.repo.get_problems(db)
        clusters = defaultdict(list)
        for p in problems:
            tag = p.cluster_tag or "UNCLUSTERED"
            clusters[tag].append(p)

        result_items = []
        for tag, plist in clusters.items():
            avg_pain = sum(p.pain_score for p in plist) / len(plist)
            max_pain = max(p.pain_score for p in plist)
            top_p = max(plist, key=lambda x: x.pain_score)
            result_items.append(
                ProblemAnalysisItem(
                    cluster_tag=tag,
                    problem_count=len(plist),
                    avg_pain_score=round(avg_pain, 1),
                    max_pain_score=max_pain,
                    top_problem_statement=top_p.problem_statement,
                )
            )

        result_items.sort(key=lambda x: (x.avg_pain_score, x.problem_count), reverse=True)
        return ProblemAnalysisResponse(
            total_problems=len(problems),
            clusters=result_items,
        )

    def analyze_jtbd(self, db: Session) -> JTBDAnalysisResponse:
        jtbds = self.repo.get_jtbds(db)
        if not jtbds:
            self.jtbd_service.ensure_default_jtbds(db)
            jtbds = self.repo.get_jtbds(db)

        items = [
            JTBDAnalysisItem(
                jtbd_key=j.jtbd_key,
                title=j.title,
                status=j.status,
                confidence_score=j.confidence_score,
                supporting_interviews=j.supporting_interviews_count,
                total_evaluated=j.total_interviews_evaluated,
            )
            for j in jtbds
        ]
        return JTBDAnalysisResponse(items=items)

    def analyze_journeys(self, db: Session) -> JourneyAnalysisResponse:
        problems = self.repo.get_problems(db)
        stages = defaultdict(list)
        for p in problems:
            stages[p.journey_stage].append(p)

        items = []
        for stage, plist in stages.items():
            avg_pain = sum(p.pain_score for p in plist) / len(plist)
            items.append(
                JourneyStageAnalysisItem(
                    journey_stage=stage,
                    problem_count=len(plist),
                    avg_pain_score=round(avg_pain, 1),
                )
            )
        items.sort(key=lambda x: x.problem_count, reverse=True)
        return JourneyAnalysisResponse(stages=items)

    def analyze_segments(self, db: Session) -> SegmentAnalysisResponse:
        participants = self.repo.get_participants(db)
        problems = self.repo.get_problems(db)

        part_by_seg = defaultdict(int)
        for p in participants:
            part_by_seg[p.segment] += 1

        prob_by_seg = defaultdict(int)
        for prob in problems:
            seg = prob.affected_segment or "GENERAL"
            prob_by_seg[seg] += 1

        all_segs = set(part_by_seg.keys()) | set(prob_by_seg.keys())
        items = [
            SegmentAnalysisItem(
                segment=s,
                participant_count=part_by_seg.get(s, 0),
                problem_count=prob_by_seg.get(s, 0),
            )
            for s in sorted(all_segs)
        ]
        return SegmentAnalysisResponse(segments=items)

    def analyze_workflow_fragmentation(self, db: Session) -> WorkflowFragmentationResponse:
        baselines = self.repo.list_baselines(db)
        if not baselines:
            return WorkflowFragmentationResponse(
                total_baselines=0,
                avg_tools_used=0.0,
                avg_duration_minutes=0.0,
                avg_searches=0.0,
                most_fragmented_task="None recorded",
                tools_frequency={},
            )

        total_tools = sum(b.workflow_fragmentation_score for b in baselines)
        total_duration = sum(b.duration_seconds for b in baselines)
        total_searches = sum(b.searches_count for b in baselines)
        tools_freq = defaultdict(int)
        for b in baselines:
            for t in b.tools_used or []:
                tools_freq[t] += 1

        most_frag = max(baselines, key=lambda x: x.workflow_fragmentation_score)

        return WorkflowFragmentationResponse(
            total_baselines=len(baselines),
            avg_tools_used=round(total_tools / len(baselines), 1),
            avg_duration_minutes=round(total_duration / (len(baselines) * 60), 1),
            avg_searches=round(total_searches / len(baselines), 1),
            most_fragmented_task=most_frag.task_id,
            tools_frequency=dict(tools_freq),
        )

    def get_summary(self, db: Session) -> ResearchDashboardSummary:
        p_count, i_count, prob_count = self.repo.get_counts(db)
        problems = self.repo.get_problems(db)
        jtbds = self.repo.get_jtbds(db)
        if not jtbds:
            self.jtbd_service.ensure_default_jtbds(db)
            jtbds = self.repo.get_jtbds(db)

        strongest_p = problems[0].problem_statement if problems else "None identified yet"
        
        clusters = defaultdict(list)
        for p in problems:
            clusters[p.cluster_tag or "UNCLUSTERED"].append(p)
        highest_cluster = (
            max(clusters.items(), key=lambda x: sum(p.pain_score for p in x[1]) / len(x[1]))[0]
            if clusters
            else "None"
        )

        journeys = defaultdict(int)
        for p in problems:
            journeys[p.journey_stage] += 1

        validated_jtbds = [
            {"key": j.jtbd_key, "title": j.title, "status": j.status}
            for j in jtbds
            if j.status in ("SUPPORTED", "STRONGLY_SUPPORTED")
        ]

        return ResearchDashboardSummary(
            participants_count=p_count,
            interviews_count=i_count,
            problems_count=prob_count,
            strongest_problem=strongest_p,
            highest_pain_cluster=highest_cluster,
            most_fragmented_workflow="Discovery → Planning (Google + Maps + YouTube + WhatsApp)",
            journey_distribution=dict(journeys),
            validated_jtbds=validated_jtbds,
        )
