import RequirementCard from "./RequirementCard";
import Pagination from "./Pagination";
import type { PublicRequirement } from "../../types/find";

interface FindResultsProps {
  requirementsLoading: boolean;
  filteredRequirements: PublicRequirement[];
  paginatedRequirements: PublicRequirement[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  currentUserRole?: "buyer" | "seller";
  sentInquiryRequirementIds?: Set<string>;
  onViewRequirement: (
    requirement: PublicRequirement,
  ) => void | Promise<void>;
  onSendInquiry: (
    requirement: PublicRequirement,
  ) => void;
  onPageChange: (page: number) => void;
}

export default function FindResults({
  requirementsLoading,
  filteredRequirements,
  paginatedRequirements,
  currentPage,
  totalPages,
  pageSize,
  currentUserRole,
  sentInquiryRequirementIds,
  onViewRequirement,
  onSendInquiry,
  onPageChange,
}: FindResultsProps) {
  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black">
            User Requirements
          </h1>

          <p className="mt-1 text-xs text-slate-400">
            {requirementsLoading
              ? "Loading requirements..."
              : `${filteredRequirements.length} requirements found`}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {paginatedRequirements.map(
          (requirement) => (
            <RequirementCard
              key={requirement.id}
              requirement={requirement}
              currentUserRole={currentUserRole}
              inquiryAlreadySent={sentInquiryRequirementIds?.has(requirement.id) ?? false}
              onView={() =>
                void onViewRequirement(
                  requirement,
                )
              }
              onInquiry={() =>
                onSendInquiry(requirement)
              }
            />
          ),
        )}
      </div>

      {filteredRequirements.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={
            filteredRequirements.length
          }
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </section>
  );
}
