import { NotFoundState } from "@/components/feedback/ErrorState";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[75vh] p-4 sm:p-8 w-full">
      <NotFoundState
        title="Destination Not Found"
        description="The requested digital coordinate or destination does not exist in the Chhattisgarh Tourism index. The location may have been renamed or relocated."
        actionHref="/explore"
        actionLabel="Explore Chhattisgarh"
      />
    </div>
  );
}
