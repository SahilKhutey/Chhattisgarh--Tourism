"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PilotDefinition, PilotData } from "@/components/market-validation/PilotDefinition";
import { PilotScopeCard } from "@/components/market-validation/PilotScopeCard";
import { PilotKpiDashboard } from "@/components/market-validation/PilotKpiDashboard";
import { LaunchControlPanel, LaunchControlItem } from "@/components/market-validation/LaunchControlPanel";
import { OperationalReadiness } from "@/components/market-validation/OperationalReadiness";
import { BastarCircuitOverview, BastarDestination, EmergencyRosterItem } from "@/components/market-validation/BastarCircuitOverview";
import { SurgujaCircuitOverview, SurgujaDestinationItem, SurgujaEmergencyRosterItem } from "@/components/market-validation/SurgujaCircuitOverview";
import { CertifiedProvidersTable, CertifiedProviderItem } from "@/components/market-validation/CertifiedProvidersTable";
import { CohortExpansionPanel, CohortExpansionData } from "@/components/market-validation/CohortExpansionPanel";
import { ScaleGovernancePanel, ScaleGovernanceData, ExpansionDossierData } from "@/components/market-validation/ScaleGovernancePanel";

const DEFAULT_CIRCUIT_CONTROLS: LaunchControlItem[] = [
  {
    id: "ctrl-traffic-limit",
    control_type: "TRAFFIC_LIMIT",
    name: "Max Daily Active Travelers",
    enabled: true,
    threshold: 500.0,
    current_value: 120.0,
    action: "THROTTLE",
    owner: "SYSTEM",
    triggered: false,
  },
  {
    id: "ctrl-booking-limit",
    control_type: "BOOKING_LIMIT",
    name: "Max Open Pending Leads per Provider",
    enabled: true,
    threshold: 10.0,
    current_value: 3.0,
    action: "HALT_BOOKINGS",
    owner: "SYSTEM",
    triggered: false,
  },
  {
    id: "ctrl-circuit-breaker",
    control_type: "CIRCUIT_BREAKER",
    name: "Max Provider Response Failure Rate %",
    enabled: true,
    threshold: 30.0,
    current_value: 8.5,
    action: "ALERT",
    owner: "SYSTEM",
    triggered: false,
  },
  {
    id: "ctrl-safety-disable",
    control_type: "SAFETY_DISABLE",
    name: "Critical Unaddressed Safety Incidents",
    enabled: true,
    threshold: 1.0,
    current_value: 0.0,
    action: "PAUSE_PILOT",
    owner: "SYSTEM",
    triggered: false,
  },
];

const DEFAULT_PROVIDERS: CertifiedProviderItem[] = [
  // 10 Vetted Tribal Homestays
  {
    id: "bastar-chitrakote-dandami-homestay",
    name: "Dandami Tribal Heritage Cottage",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Chitrakote",
    location: "Chitrakote Falls Plateau",
    latitude: 19.2025,
    longitude: 81.7075,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 12,
    current_open_leads: 3,
    max_lead_limit: 10,
    response_time_sla_hours: 1.8,
    contact_phone: "+91-7782-229045",
    languages: ["Gondi", "Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Organic Tribal Meals", "Solar Power", "Bilingual Host", "First Aid Kit"],
  },
  {
    id: "bastar-chitrakote-falls-view-stay",
    name: "Chitrakote Falls Cliff Edge Homestay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Chitrakote",
    location: "Near Sunset Point, Chitrakote",
    latitude: 19.2008,
    longitude: 81.7042,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 8,
    current_open_leads: 2,
    max_lead_limit: 10,
    response_time_sla_hours: 2.1,
    contact_phone: "+91-7782-229046",
    languages: ["Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Gorge View", "Traditional Thali", "River Walk Guide"],
  },
  {
    id: "bastar-tirathgarh-eco-retreat",
    name: "Tirathgarh Tribal Valley Homestay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Tirathgarh",
    location: "Tirathgarh Village Buffer Zone",
    latitude: 18.9180,
    longitude: 81.8650,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 10,
    current_open_leads: 4,
    max_lead_limit: 10,
    response_time_sla_hours: 2.5,
    contact_phone: "+91-7782-228951",
    languages: ["Gondi", "Hindi"],
    safety_trained: true,
    amenities: ["Mugga Silk Weaving Walk", "Forest Honey Tasting", "Emergency Satellite Beacon"],
  },
  {
    id: "bastar-tirathgarh-munda-stay",
    name: "Munda Tribal Heritage Home",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Tirathgarh",
    location: "Lower Tirathgarh Stream",
    latitude: 18.9145,
    longitude: 81.8682,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 6,
    current_open_leads: 1,
    max_lead_limit: 10,
    response_time_sla_hours: 1.5,
    contact_phone: "+91-7782-228952",
    languages: ["Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Stream Bathing Guide", "Mahua Forest Trail", "First Aid Trained"],
  },
  {
    id: "bastar-kanger-kotumsar-camp",
    name: "Kotumsar Cave Forest Camp",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Kanger Valley",
    location: "Kanger Valley Gate Entry",
    latitude: 18.8850,
    longitude: 81.9310,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 14,
    current_open_leads: 5,
    max_lead_limit: 10,
    response_time_sla_hours: 2.0,
    contact_phone: "+91-7782-228953",
    languages: ["Gondi", "Halbi", "Hindi", "English"],
    safety_trained: true,
    amenities: ["Caving Equipment Rental", "National Park Passes", "Solar Hot Water"],
  },
  {
    id: "bastar-kanger-gupteshwar-lodge",
    name: "Gupteshwar Gorge Eco Homestay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Kanger Valley",
    location: "Sabari River Confluence, Kanger",
    latitude: 18.8720,
    longitude: 81.9450,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 8,
    current_open_leads: 2,
    max_lead_limit: 10,
    response_time_sla_hours: 2.8,
    contact_phone: "+91-7782-228954",
    languages: ["Gondi", "Hindi"],
    safety_trained: true,
    amenities: ["Limestone Cave Walk", "Bird Watching Tower", "First Aid Kit"],
  },
  {
    id: "bastar-dholkal-ganesh-basecamp",
    name: "Dholkal Peak Tribal Trek Basecamp",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Dholkal Ganesh",
    location: "Faraspal Village, Dantewada",
    latitude: 18.7810,
    longitude: 81.2950,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 16,
    current_open_leads: 4,
    max_lead_limit: 10,
    response_time_sla_hours: 1.9,
    contact_phone: "+91-7856-252410",
    languages: ["Gondi", "Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Trekking Poles & Boots", "Early Morning Summit Rations", "GPS Tracker"],
  },
  {
    id: "bastar-dholkal-bailadila-haven",
    name: "Bailadila Foothills Tribal Homestay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Dholkal Ganesh",
    location: "Bacheli Foothills",
    latitude: 18.7200,
    longitude: 81.2500,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 10,
    current_open_leads: 3,
    max_lead_limit: 10,
    response_time_sla_hours: 3.0,
    contact_phone: "+91-7856-252411",
    languages: ["Hindi", "English"],
    safety_trained: true,
    amenities: ["Mountain Biking", "Local Gond Folk Evenings", "Emergency Contact Station"],
  },
  {
    id: "bastar-jagdalpur-bastariya-stay",
    name: "Bastariya Cultural Homestay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Jagdalpur Hub",
    location: "Jagdalpur City Transit Base",
    latitude: 19.0735,
    longitude: 82.0289,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 12,
    current_open_leads: 5,
    max_lead_limit: 10,
    response_time_sla_hours: 1.2,
    contact_phone: "+91-7782-220555",
    languages: ["Gondi", "Halbi", "Hindi", "English"],
    safety_trained: true,
    amenities: ["Airport/Railway Pickup", "High-speed Wi-Fi", "Circuit Route Briefing"],
  },
  {
    id: "bastar-kondagaon-dhokra-stay",
    name: "Bell Metal Art Village Stay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Kondagaon Waypoint",
    location: "Bhelvapadar Artisan Enclave, Kondagaon",
    latitude: 19.5960,
    longitude: 81.6660,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 8,
    current_open_leads: 2,
    max_lead_limit: 10,
    response_time_sla_hours: 2.2,
    contact_phone: "+91-7786-242100",
    languages: ["Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Dhokra Metal Casting Workshop", "Terracotta Craft Studio", "Traditional Cooking"],
  },

  // 8 Licensed Tribal Guides
  {
    id: "guide-chitrakote-badal-mandavi",
    name: "Badal Mandavi (Senior Gondi Nature Guide)",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Chitrakote",
    location: "Chitrakote River Basin",
    latitude: 19.2017,
    longitude: 81.7061,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 15,
    current_open_leads: 3,
    max_lead_limit: 10,
    response_time_sla_hours: 1.4,
    contact_phone: "+91-7782-229101",
    languages: ["Gondi", "Halbi", "Hindi", "English"],
    safety_trained: true,
    amenities: ["River Safety Certified", "Folklore Interpretation", "Binoculars Provided"],
  },
  {
    id: "guide-chitrakote-sukhram-kashyap",
    name: "Sukhram Kashyap (Waterfalls & Heritage Storyteller)",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Chitrakote",
    location: "Chitradhara & Chitrakote",
    latitude: 19.2050,
    longitude: 81.7080,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 10,
    current_open_leads: 2,
    max_lead_limit: 10,
    response_time_sla_hours: 2.0,
    contact_phone: "+91-7782-229102",
    languages: ["Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Historic Battle of Bastar Narratives", "Sunset Photography Spots"],
  },
  {
    id: "guide-tirathgarh-somaru-baghel",
    name: "Somaru Baghel (Geology & Canyon Trek Guide)",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Tirathgarh",
    location: "Tirathgarh 3-Tier Falls",
    latitude: 18.9167,
    longitude: 81.8667,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 12,
    current_open_leads: 3,
    max_lead_limit: 10,
    response_time_sla_hours: 1.6,
    contact_phone: "+91-7782-228960",
    languages: ["Gondi", "Hindi"],
    safety_trained: true,
    amenities: ["Canyon Scrambling Ropes", "Aquatic Safety Cert", "Medicinal Plants Tour"],
  },
  {
    id: "guide-kanger-chaitu-maravi",
    name: "Chaitu Maravi (Biospeleology Cave Specialist)",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Kanger Valley",
    location: "Kotumsar & Kailash Caves",
    latitude: 18.8833,
    longitude: 81.9333,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 12,
    current_open_leads: 4,
    max_lead_limit: 10,
    response_time_sla_hours: 1.5,
    contact_phone: "+91-7782-228961",
    languages: ["Gondi", "Halbi", "Hindi", "English"],
    safety_trained: true,
    amenities: ["Oxygen & CO2 Cave Detectors", "Cave Helmet & Headlamps", "Blind Fish Biology"],
  },
  {
    id: "guide-kanger-rainu-kunjam",
    name: "Rainu Kunjam (Wildlife & Birding Specialist)",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Kanger Valley",
    location: "Kanger Dhara & National Park",
    latitude: 18.8900,
    longitude: 81.9200,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 8,
    current_open_leads: 1,
    max_lead_limit: 10,
    response_time_sla_hours: 2.3,
    contact_phone: "+91-7782-228962",
    languages: ["Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Bastar Hill Myna Call mimicry", "Spotting Scope", "Snake Rescue Certified"],
  },
  {
    id: "guide-dholkal-budhram-netam",
    name: "Budhram Netam (High-Altitude Rock & Temple Trek Guide)",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Dholkal Ganesh",
    location: "Dholkal Peak Trailhead",
    latitude: 18.7735,
    longitude: 81.2891,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 10,
    current_open_leads: 4,
    max_lead_limit: 10,
    response_time_sla_hours: 1.7,
    contact_phone: "+91-7856-252415",
    languages: ["Gondi", "Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Climbing Safety Harness", "Altitude Sickness Kit", "Ancient Idol Legend Guide"],
  },
  {
    id: "guide-jagdalpur-mangal-korram",
    name: "Mangal Korram (Anthropological & Haat Guide)",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Jagdalpur Hub",
    location: "Jagdalpur & Tokapal Weekly Haats",
    latitude: 19.0735,
    longitude: 82.0289,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 12,
    current_open_leads: 2,
    max_lead_limit: 10,
    response_time_sla_hours: 1.8,
    contact_phone: "+91-7782-220556",
    languages: ["Gondi", "Halbi", "Hindi", "English"],
    safety_trained: true,
    amenities: ["Tribal Haat Barter Etiquette", "Handicraft Price Negotiation", "Local Food Tasting"],
  },
  {
    id: "guide-kondagaon-ramesh-ghadwa",
    name: "Ramesh Ghadwa (Dhokra Artisan & Metal Trail Guide)",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Kondagaon Waypoint",
    location: "Kondagaon Craft Guild",
    latitude: 19.5960,
    longitude: 81.6660,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 10,
    current_open_leads: 1,
    max_lead_limit: 10,
    response_time_sla_hours: 2.4,
    contact_phone: "+91-7786-242101",
    languages: ["Halbi", "Hindi"],
    safety_trained: true,
    amenities: ["Direct Artisan Meet", "GI-Certified Dhokra Verification", "Packing & Shipping Help"],
  },
];

const DEFAULT_SURGUJA_CONTROLS: LaunchControlItem[] = [
  {
    id: "ctrl-surguja-traffic-limit",
    control_type: "TRAFFIC_LIMIT",
    name: "Max Daily Active Travelers (Surguja)",
    enabled: true,
    threshold: 400.0,
    current_value: 85.0,
    action: "THROTTLE",
    owner: "SYSTEM",
    triggered: false,
  },
  {
    id: "ctrl-surguja-booking-limit",
    control_type: "BOOKING_LIMIT",
    name: "Max Open Pending Leads per Surguja Host",
    enabled: true,
    threshold: 8.0,
    current_value: 2.0,
    action: "HALT_BOOKINGS",
    owner: "SYSTEM",
    triggered: false,
  },
  {
    id: "ctrl-surguja-failure-rate",
    control_type: "CIRCUIT_BREAKER",
    name: "Max Provider Response Failure Rate % (Surguja)",
    enabled: true,
    threshold: 25.0,
    current_value: 6.2,
    action: "ALERT",
    owner: "SYSTEM",
    triggered: false,
  },
  {
    id: "ctrl-surguja-safety-killswitch",
    control_type: "SAFETY_DISABLE",
    name: "Critical Unaddressed Safety Incidents (Surguja)",
    enabled: true,
    threshold: 1.0,
    current_value: 0.0,
    action: "PAUSE_PILOT",
    owner: "SYSTEM",
    triggered: false,
  },
];

const DEFAULT_SURGUJA_PROVIDERS: CertifiedProviderItem[] = [
  {
    id: "surguja-mainpat-tibetan-homestay",
    name: "Dhakpo Heritage Tibetan Homestay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Mainpat Plateau",
    location: "Camp No. 1, Mainpat",
    latitude: 22.815,
    longitude: 83.287,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 12,
    current_open_leads: 2,
    max_lead_limit: 8,
    response_time_sla_hours: 1.6,
    contact_phone: "+91-7774-275201",
    languages: ["Tibetan", "Hindi", "English"],
    safety_trained: true,
    amenities: ["Tibetan Butter Tea & Momos", "Monastery Meditation Walk", "Solar Water Heating"],
  },
  {
    id: "surguja-mainpat-jaljali-retreat",
    name: "Jaljali Bouncing Peatland Eco-Stay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Mainpat Plateau",
    location: "Jaljali Meadow Waypoint",
    latitude: 22.809,
    longitude: 83.275,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 10,
    current_open_leads: 3,
    max_lead_limit: 8,
    response_time_sla_hours: 1.8,
    contact_phone: "+91-7774-275202",
    languages: ["Chhattisgarhi", "Hindi"],
    safety_trained: true,
    amenities: ["Peatland Nature Walks", "Organic Millets Dining", "Stargazing Deck"],
  },
  {
    id: "surguja-mainpat-tigerpoint-stay",
    name: "Tiger Point Falls Valley Cottage",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Mainpat Plateau",
    location: "Near Tiger Point Waterfall, Mainpat",
    latitude: 22.821,
    longitude: 83.301,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 8,
    current_open_leads: 1,
    max_lead_limit: 8,
    response_time_sla_hours: 1.5,
    contact_phone: "+91-7774-275203",
    languages: ["Hindi", "Chhattisgarhi"],
    safety_trained: true,
    amenities: ["Gorge View Balcony", "Waterfall Trek Guide", "Fireplace Lounge"],
  },
  {
    id: "surguja-mainpat-fishpoint-farmstay",
    name: "Machhli Point Stream Farmstay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Mainpat Plateau",
    location: "Fish Point Gorge Trail",
    latitude: 22.828,
    longitude: 83.292,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 6,
    current_open_leads: 2,
    max_lead_limit: 8,
    response_time_sla_hours: 1.9,
    contact_phone: "+91-7774-275204",
    languages: ["Kudukh", "Hindi"],
    safety_trained: true,
    amenities: ["Stream Angling", "Fresh Local Trout Meals", "Emergency Satellite Beacon"],
  },
  {
    id: "surguja-ramgarh-heritage-lodge",
    name: "Ramgarh Ancient Theatre Heritage Home",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Ramgarh Caves",
    location: "Base of Ramgarh Hill, Udaypur",
    latitude: 22.879,
    longitude: 82.912,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 10,
    current_open_leads: 1,
    max_lead_limit: 8,
    response_time_sla_hours: 1.7,
    contact_phone: "+91-7774-232201",
    languages: ["Chhattisgarhi", "Hindi"],
    safety_trained: true,
    amenities: ["Kalidasa Inscription Tour", "Traditional Chhattisgarhi Thali", "Certified Cave Guide"],
  },
  {
    id: "surguja-ramgarh-sita-bengra-stay",
    name: "Sita Bengra Cliff View Stay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Ramgarh Caves",
    location: "Udaypur Ridge Road",
    latitude: 22.881,
    longitude: 82.918,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 8,
    current_open_leads: 2,
    max_lead_limit: 8,
    response_time_sla_hours: 2.1,
    contact_phone: "+91-7774-232202",
    languages: ["Hindi", "English"],
    safety_trained: true,
    amenities: ["Ancient Inscription Rubbing Guide", "Hill Trekking Equipment"],
  },
  {
    id: "surguja-tatapani-sulfur-spring-stay",
    name: "Tatapani Thermal Springs Wellness Lodge",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Tatapani Springs",
    location: "Tatapani Geothermal Park Road",
    latitude: 23.689,
    longitude: 83.653,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 14,
    current_open_leads: 2,
    max_lead_limit: 8,
    response_time_sla_hours: 1.4,
    contact_phone: "+91-7774-261301",
    languages: ["Chhattisgarhi", "Bhojpuri", "Hindi"],
    safety_trained: true,
    amenities: ["Private Thermal Sulfur Bath Access", "Ayurvedic Herbal Massages"],
  },
  {
    id: "surguja-tatapani-kund-homestay",
    name: "Shiva Kund Thermal Eco-Stay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Tatapani Springs",
    location: "Near Tatapani Temple Complex",
    latitude: 23.685,
    longitude: 83.649,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 8,
    current_open_leads: 1,
    max_lead_limit: 8,
    response_time_sla_hours: 1.6,
    contact_phone: "+91-7774-261302",
    languages: ["Hindi", "Chhattisgarhi"],
    safety_trained: true,
    amenities: ["Thermal Water Pool", "Pilgrimage Guide", "Organic Garden Dining"],
  },
  {
    id: "surguja-kailash-gufa-sal-retreat",
    name: "Kailash Gufa Sal Forest Camp",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Kailash Gufa",
    location: "Bagicha Reserve Forest Buffer",
    latitude: 22.953,
    longitude: 83.624,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 10,
    current_open_leads: 2,
    max_lead_limit: 8,
    response_time_sla_hours: 2.2,
    contact_phone: "+91-7774-252201",
    languages: ["Oraon", "Hindi"],
    safety_trained: true,
    amenities: ["Sal Forest Eco-Tents", "Cave Acoustic Meditation Tour"],
  },
  {
    id: "surguja-kailash-bageesha-stay",
    name: "Bageesha Waterfall & Cave Homestay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Kailash Gufa",
    location: "Upper Bagicha Stream",
    latitude: 22.948,
    longitude: 83.618,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 6,
    current_open_leads: 1,
    max_lead_limit: 8,
    response_time_sla_hours: 1.8,
    contact_phone: "+91-7774-252202",
    languages: ["Chhattisgarhi", "Hindi"],
    safety_trained: true,
    amenities: ["Wild Honey Harvesting Demo", "Waterfall Natural Pool"],
  },
  {
    id: "surguja-ambikapur-mahua-garden-stay",
    name: "Mahua Heritage Villa & Gateway Hub",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Ambikapur Hub",
    location: "Gandhi Nagar Ring Road, Ambikapur",
    latitude: 23.118,
    longitude: 83.195,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 16,
    current_open_leads: 3,
    max_lead_limit: 8,
    response_time_sla_hours: 1.2,
    contact_phone: "+91-7774-222501",
    languages: ["Hindi", "English", "Chhattisgarhi"],
    safety_trained: true,
    amenities: ["Circuit Fleet Logistics", "Luggage Storage", "24/7 Power"],
  },
  {
    id: "surguja-sitapur-hillside-farm",
    name: "Sitapur Valley Hillside Farmstay",
    provider_type: "HOMESTAY",
    segment: "RURAL_HOMESTAYS",
    sub_circuit: "Mainpat Plateau",
    location: "Sitapur Foothills",
    latitude: 22.781,
    longitude: 83.31,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 8,
    current_open_leads: 1,
    max_lead_limit: 8,
    response_time_sla_hours: 1.7,
    contact_phone: "+91-7774-245201",
    languages: ["Chhattisgarhi", "Hindi"],
    safety_trained: true,
    amenities: ["Tawad River Kayaking", "Organic Vegetable Picking"],
  },
  // 8 Licensed Guides
  {
    id: "guide-surguja-tenzin-norbu",
    name: "Tenzin Norbu",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Mainpat Plateau",
    location: "Mainpat Monastery Hub",
    latitude: 22.814,
    longitude: 83.286,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 15,
    current_open_leads: 2,
    max_lead_limit: 8,
    response_time_sla_hours: 1.3,
    contact_phone: "+91-7774-275301",
    languages: ["Tibetan", "English", "Hindi"],
    safety_trained: true,
    amenities: ["Certified Tibetan Buddhist Scholar", "Thangka Interpreter"],
  },
  {
    id: "guide-surguja-rameshwar-gond",
    name: "Rameshwar Gond",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Ramgarh Caves",
    location: "Udaypur Historical Center",
    latitude: 22.88,
    longitude: 82.915,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 20,
    current_open_leads: 2,
    max_lead_limit: 8,
    response_time_sla_hours: 1.6,
    contact_phone: "+91-7774-232301",
    languages: ["Chhattisgarhi", "Hindi"],
    safety_trained: true,
    amenities: ["Archaeological Cave Navigation", "Kalidasa Poetry Recitation"],
  },
  {
    id: "guide-surguja-sunil-tirkey",
    name: "Sunil Tirkey",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Tatapani Springs",
    location: "Tatapani Tourist Facility",
    latitude: 23.687,
    longitude: 83.652,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 18,
    current_open_leads: 1,
    max_lead_limit: 8,
    response_time_sla_hours: 1.5,
    contact_phone: "+91-7774-261401",
    languages: ["Chhattisgarhi", "Hindi"],
    safety_trained: true,
    amenities: ["Geothermal Safety Expert", "Hydrological First Aid"],
  },
  {
    id: "guide-surguja-birsa-oraon",
    name: "Birsa Oraon",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Kailash Gufa",
    location: "Bagicha Forest Post",
    latitude: 22.952,
    longitude: 83.623,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 12,
    current_open_leads: 2,
    max_lead_limit: 8,
    response_time_sla_hours: 1.8,
    contact_phone: "+91-7774-252301",
    languages: ["Oraon", "Chhattisgarhi", "Hindi"],
    safety_trained: true,
    amenities: ["Traditional Herbalist & Botanist", "Wilderness Survival"],
  },
  {
    id: "guide-surguja-deepti-ekka",
    name: "Deepti Ekka",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Mainpat Plateau",
    location: "Mainpat Adventure Center",
    latitude: 22.819,
    longitude: 83.291,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 16,
    current_open_leads: 1,
    max_lead_limit: 8,
    response_time_sla_hours: 1.4,
    contact_phone: "+91-7774-275302",
    languages: ["English", "Hindi", "Chhattisgarhi"],
    safety_trained: true,
    amenities: ["Women Travelers Lead Guide", "Mainpat Birding & Flora Expert"],
  },
  {
    id: "guide-surguja-anand-kujur",
    name: "Anand Kujur",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Ramgarh Caves",
    location: "Maheshpur Archaeological Spoke",
    latitude: 22.895,
    longitude: 82.934,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 15,
    current_open_leads: 2,
    max_lead_limit: 8,
    response_time_sla_hours: 1.7,
    contact_phone: "+91-7774-232302",
    languages: ["Hindi", "Chhattisgarhi"],
    safety_trained: true,
    amenities: ["Maheshpur Temple Historian", "CPR Certified"],
  },
  {
    id: "guide-surguja-pema-dorjee",
    name: "Pema Dorjee",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Mainpat Plateau",
    location: "Camp No. 2, Mainpat",
    latitude: 22.811,
    longitude: 83.281,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 14,
    current_open_leads: 1,
    max_lead_limit: 8,
    response_time_sla_hours: 1.5,
    contact_phone: "+91-7774-275303",
    languages: ["Tibetan", "Hindi", "English"],
    safety_trained: true,
    amenities: ["Highland Peatland Geology Guide", "First Aid Certified"],
  },
  {
    id: "guide-surguja-karan-singh-netam",
    name: "Karan Singh Netam",
    provider_type: "GUIDE",
    segment: "LICENSED_TRIBAL_GUIDES",
    sub_circuit: "Kailash Gufa",
    location: "Jashpur Border Outpost",
    latitude: 22.955,
    longitude: 83.626,
    verification_status: "VERIFIED",
    certification_level: "LEVEL_3_CERTIFIED",
    daily_capacity: 16,
    current_open_leads: 2,
    max_lead_limit: 8,
    response_time_sla_hours: 1.9,
    contact_phone: "+91-7774-252302",
    languages: ["Chhattisgarhi", "Hindi"],
    safety_trained: true,
    amenities: ["Dense Sal Canopy Trekker", "Wildlife Tracking"],
  },
];

export default function PilotAdminPage() {
  const [pilot, setPilot] = useState<PilotData | null>(null);
  const [allPilots, setAllPilots] = useState<PilotData[]>([]);
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>("bastar-circuit-1");
  const [controls, setControls] = useState<LaunchControlItem[]>(DEFAULT_CIRCUIT_CONTROLS);
  const [providers, setProviders] = useState<CertifiedProviderItem[]>(DEFAULT_PROVIDERS);
  const [destinations, setDestinations] = useState<BastarDestination[]>([]);
  const [emergencyRoster, setEmergencyRoster] = useState<EmergencyRosterItem[]>([]);
  const [founderInterventionRate, setFounderInterventionRate] = useState<number>(0.117);
  const [cohortData, setCohortData] = useState<CohortExpansionData | null>(null);
  const [scaleGovernanceData, setScaleGovernanceData] = useState<ScaleGovernanceData | null>(null);
  const [expansionDossierData, setExpansionDossierData] = useState<ExpansionDossierData | null>(null);
  const [activePhase, setActivePhase] = useState<"ALL" | "PHASE_1" | "PHASE_2" | "PHASE_3">("ALL");
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const loadCircuitDetails = useCallback((targetPilot: PilotData) => {
    // Fetch circuit readiness, controls, and providers
    fetch(`/api/v1/market-validation/pilots/${targetPilot.id}/circuit-readiness`)
      .then((res) => (res.ok ? res.json() : null))
      .then((readiness) => {
        if (readiness) {
          if (readiness.destinations) setDestinations(readiness.destinations);
          if (readiness.emergency_roster) setEmergencyRoster(readiness.emergency_roster);
          if (readiness.founder_intervention_rate !== undefined) {
            setFounderInterventionRate(readiness.founder_intervention_rate);
          }
        }
      })
      .catch(() => {});

    fetch(`/api/v1/market-validation/pilots/${targetPilot.id}/certified-providers`)
      .then((res) => (res.ok ? res.json() : null))
      .then((provs) => {
        if (Array.isArray(provs) && provs.length > 0) {
          setProviders(provs);
        } else if (targetPilot.name.toLowerCase().includes("surguja")) {
          setProviders(DEFAULT_SURGUJA_PROVIDERS);
        } else {
          setProviders(DEFAULT_PROVIDERS);
        }
      })
      .catch(() => {
        if (targetPilot.name.toLowerCase().includes("surguja")) {
          setProviders(DEFAULT_SURGUJA_PROVIDERS);
        } else {
          setProviders(DEFAULT_PROVIDERS);
        }
      });

    fetch(`/api/v1/market-validation/launch-controls/${targetPilot.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((ctrls) => {
        if (Array.isArray(ctrls) && ctrls.length > 0) {
          setControls(ctrls);
        } else if (targetPilot.name.toLowerCase().includes("surguja")) {
          setControls(DEFAULT_SURGUJA_CONTROLS);
        } else {
          setControls(DEFAULT_CIRCUIT_CONTROLS);
        }
      })
      .catch(() => {
        if (targetPilot.name.toLowerCase().includes("surguja")) {
          setControls(DEFAULT_SURGUJA_CONTROLS);
        } else {
          setControls(DEFAULT_CIRCUIT_CONTROLS);
        }
      });

    // Fetch Phase 2 & Phase 3 telemetry
    fetch(`/api/v1/market-validation/pilots/${targetPilot.id}/cohort-expansion`)
      .then((res) => (res.ok ? res.json() : null))
      .then((expansion) => {
        if (expansion) setCohortData(expansion);
      })
      .catch(() => {});

    fetch(`/api/v1/market-validation/pilots/${targetPilot.id}/scale-governance`)
      .then((res) => (res.ok ? res.json() : null))
      .then((gov) => {
        if (gov) setScaleGovernanceData(gov);
      })
      .catch(() => {});

    fetch(`/api/v1/market-validation/pilots/${targetPilot.id}/expansion-dossier`)
      .then((res) => (res.ok ? res.json() : null))
      .then((dos) => {
        if (dos) setExpansionDossierData(dos);
      })
      .catch(() => {});
  }, []);

  const fetchPilot = useCallback(() => {
    setLoading(true);
    fetch("/api/v1/market-validation/pilots", {
      headers: { "X-User-Role": "PILOT_OPERATOR" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllPilots(data);
          const chosen = selectedCircuitId === "surguja-circuit-2"
            ? data.find((p) => p.name.toLowerCase().includes("surguja")) || data[1] || data[0]
            : data.find((p) => p.name.toLowerCase().includes("bastar")) || data[0];
          setPilot(chosen);
          loadCircuitDetails(chosen);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [loadCircuitDetails, selectedCircuitId]);

  const handleSwitchCircuit = (circuitId: string) => {
    setSelectedCircuitId(circuitId);
    if (circuitId === "surguja-circuit-2") {
      const surg = allPilots.find((p) => p.name.toLowerCase().includes("surguja"));
      if (surg) {
        setPilot(surg);
        loadCircuitDetails(surg);
      } else {
        setControls(DEFAULT_SURGUJA_CONTROLS);
        setProviders(DEFAULT_SURGUJA_PROVIDERS);
        setDestinations([]);
        setFounderInterventionRate(0.085);
      }
    } else {
      const bast = allPilots.find((p) => p.name.toLowerCase().includes("bastar")) || allPilots[0];
      if (bast) {
        setPilot(bast);
        loadCircuitDetails(bast);
      } else {
        setControls(DEFAULT_CIRCUIT_CONTROLS);
        setProviders(DEFAULT_PROVIDERS);
        setDestinations([]);
        setFounderInterventionRate(0.117);
      }
    }
  };

  useEffect(() => {
    fetchPilot();
  }, [fetchPilot]);

  const handlePause = () => {
    if (!pilot) return;
    fetch(`/api/v1/market-validation/pilots/${pilot.id}/pause`, {
      method: "POST",
      headers: {
        "X-User-Role": "PILOT_OPERATOR",
        "If-Match": `"${pilot.version}"`,
      },
    })
      .then((res) => res.json())
      .then((updated) => setPilot(updated));
  };

  const handleResume = () => {
    if (!pilot) return;
    fetch(`/api/v1/market-validation/pilots/${pilot.id}/resume`, {
      method: "POST",
      headers: {
        "X-User-Role": "PILOT_OPERATOR",
        "If-Match": `"${pilot.version}"`,
      },
    })
      .then((res) => res.json())
      .then((updated) => setPilot(updated));
  };

  const handleComplete = () => {
    if (!pilot) return;
    fetch(`/api/v1/market-validation/pilots/${pilot.id}/complete`, {
      method: "POST",
      headers: {
        "X-User-Role": "PILOT_OPERATOR",
        "If-Match": `"${pilot.version}"`,
      },
    })
      .then((res) => res.json())
      .then((updated) => setPilot(updated));
  };

  const handleTransition = (target: string) => {
    if (!pilot) return;
    fetch(`/api/v1/market-validation/pilots/${pilot.id}/transition/${target}`, {
      method: "POST",
      headers: {
        "X-User-Role": "PILOT_OPERATOR",
        "If-Match": `"${pilot.version}"`,
      },
    })
      .then((res) => res.json())
      .then((updated) => setPilot(updated));
  };

  const handleToggleControl = (controlId: string, enabled: boolean) => {
    fetch(`/api/v1/market-validation/launch-controls/control/${controlId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "PILOT_OPERATOR",
      },
      body: JSON.stringify({ enabled }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setControls((prev) =>
          prev.map((c) => (c.id === controlId ? { ...c, enabled: updated.enabled, triggered: updated.triggered } : c))
        );
      })
      .catch(() => {
        setControls((prev) =>
          prev.map((c) => (c.id === controlId ? { ...c, enabled } : c))
        );
      });
  };

  const handleSimulateEmergencyIncident = () => {
    if (!pilot) return;
    setIsSimulating(true);
    fetch(`/api/v1/market-validation/launch-controls/${pilot.id}/simulate-incident`, {
      method: "POST",
      headers: {
        "X-User-Role": "PILOT_OPERATOR",
      },
    })
      .then((res) => res.json())
      .then((evalResp) => {
        setIsSimulating(false);
        if (evalResp && evalResp.controls) {
          setControls(evalResp.controls);
        }
        if (evalResp && evalResp.pilot_status) {
          setPilot((prev) => (prev ? { ...prev, status: evalResp.pilot_status } : prev));
        }
      })
      .catch(() => {
        setIsSimulating(false);
        // Fallback local simulation
        setControls((prev) =>
          prev.map((c) =>
            c.control_type === "SAFETY_DISABLE"
              ? { ...c, current_value: 1.0, triggered: true }
              : c
          )
        );
        setPilot((prev) => (prev ? { ...prev, status: "PAUSED" } : prev));
      });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          90-Day Pilot Lockdown &amp; Operational Readiness • Bastar Circuit 1
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Bastar Circuit 1 Execution Command &amp; Launch Controls
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          High-integrity operational console for Bastar Tribal Heritage Circuit 1 (Chitrakote Falls, Tirathgarh Falls, Kanger Valley Caves, Dholkal Ganesh). Enforcing 18 vetted homestays &amp; guides certification, SOS emergency escalation, 500 daily active travelers cap, max 10 open leads/host, &amp; founder decoupling (&lt; 20%).
        </p>
      </div>

      {/* Multi-Circuit Operational Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleSwitchCircuit("bastar-circuit-1")}
          className={`p-4 rounded-xl border text-left transition-all relative ${
            selectedCircuitId === "bastar-circuit-1"
              ? "bg-slate-900 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/30"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                selectedCircuitId === "bastar-circuit-1"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              Circuit 1 • Production Hardened
            </span>
            <span className="text-xs font-mono font-semibold text-emerald-400">100% Ready</span>
          </div>
          <h3 className="font-bold text-base mt-2 flex items-center gap-2">
            Bastar Tribal Heritage Circuit
          </h3>
          <p
            className={`text-xs mt-1 ${
              selectedCircuitId === "bastar-circuit-1" ? "text-slate-300" : "text-slate-500"
            }`}
          >
            Chitrakote Falls • Tirathgarh • Kotumsar Caves • Dholkal Ganesh (18 Certified Providers • 500 Daily Cap)
          </p>
        </button>

        <button
          onClick={() => handleSwitchCircuit("surguja-circuit-2")}
          className={`p-4 rounded-xl border text-left transition-all relative ${
            selectedCircuitId === "surguja-circuit-2"
              ? "bg-slate-900 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/30"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                selectedCircuitId === "surguja-circuit-2"
                  ? "bg-indigo-950 text-indigo-300 border border-indigo-800"
                  : "bg-indigo-100 text-indigo-800"
              }`}
            >
              Circuit 2 • Secondary Expansion Pilot
            </span>
            <span className="text-xs font-mono font-semibold text-indigo-400">Authorized Scale</span>
          </div>
          <h3 className="font-bold text-base mt-2 flex items-center gap-2">
            Surguja Ecotourism Circuit
          </h3>
          <p
            className={`text-xs mt-1 ${
              selectedCircuitId === "surguja-circuit-2" ? "text-slate-300" : "text-slate-500"
            }`}
          >
            Mainpat Plateau • Ramgarh Ancient Theatre • Tatapani Springs • Kailash Gufa (20 Certified Providers • 400 Daily Cap)
          </p>
        </button>
      </div>

      {pilot ? (
        <>
          <PilotDefinition
            pilot={pilot}
            onPause={handlePause}
            onResume={handleResume}
            onComplete={handleComplete}
            onTransition={handleTransition}
            isLoading={loading}
          />

          {/* 90-Day Post-Validation Roadmap Phase Selector */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActivePhase("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePhase === "ALL"
                  ? "bg-slate-100 text-slate-900 shadow-sm"
                  : "bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              All 90-Day Phases
            </button>
            <button
              onClick={() => setActivePhase("PHASE_1")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activePhase === "PHASE_1"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Phase 1: Pilot Lockdown &amp; Safety (Days 1–30)
            </button>
            <button
              onClick={() => setActivePhase("PHASE_2")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activePhase === "PHASE_2"
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
              Phase 2: Feeder Cohorts &amp; ₹25 Economics (Days 31–60)
            </button>
            <button
              onClick={() => setActivePhase("PHASE_3")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activePhase === "PHASE_3"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Phase 3: Scale Scorecard &amp; Surguja Expansion (Days 61–90)
            </button>
          </div>

          {/* Phase 1: Days 1–30 Bastar / Surguja Circuit Topology & Providers */}
          {(activePhase === "ALL" || activePhase === "PHASE_1") && (
            <div className="space-y-6">
              {/* Conditional Circuit Topology & Safety Escalation */}
              {selectedCircuitId === "surguja-circuit-2" ? (
                <SurgujaCircuitOverview
                  pilotId={pilot.id}
                  destinations={destinations.length > 0 ? (destinations as unknown as SurgujaDestinationItem[]) : undefined}
                  emergencyRoster={emergencyRoster.length > 0 ? (emergencyRoster as unknown as SurgujaEmergencyRosterItem[]) : undefined}
                  onSimulateIncident={handleSimulateEmergencyIncident}
                  isSimulating={isSimulating}
                />
              ) : (
                <BastarCircuitOverview
                  pilotId={pilot.id}
                  destinations={destinations.length > 0 ? destinations : undefined}
                  emergencyRoster={emergencyRoster.length > 0 ? emergencyRoster : undefined}
                  onSimulateIncident={handleSimulateEmergencyIncident}
                  isSimulating={isSimulating}
                />
              )}

              {/* Automated Launch Controls & Circuit Breakers */}
              <LaunchControlPanel
                controls={controls}
                onToggleControl={handleToggleControl}
              />

              {/* Certified Tribal Homestays & Licensed Guides Network */}
              <CertifiedProvidersTable
                providers={providers}
                loading={loading}
              />

              {/* Operational Readiness & Founder Decoupling Telemetry */}
              <OperationalReadiness
                founderInterventionRate={founderInterventionRate}
                readinessStatus={founderInterventionRate <= 0.2 ? "READY" : "ATTENTION_REQUIRED"}
              />

              <PilotKpiDashboard />

              <PilotScopeCard
                inScope={pilot.product_scope?.in_scope}
                outOfScope={pilot.product_scope?.out_of_scope}
              />
            </div>
          )}

          {/* Phase 2: Days 31–60 Feeder Cohorts & ₹25 Monetization */}
          {(activePhase === "ALL" || activePhase === "PHASE_2") && (
            <CohortExpansionPanel
              data={cohortData}
              loading={loading}
            />
          )}

          {/* Phase 3: Days 61–90 Scale Scorecard & Surguja Expansion */}
          {(activePhase === "ALL" || activePhase === "PHASE_3") && (
            <ScaleGovernancePanel
              governanceData={scaleGovernanceData}
              dossierData={expansionDossierData}
              loading={loading}
            />
          )}
        </>
      ) : (
        <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
          Loading pilot configuration...
        </div>
      )}
    </div>
  );
}
