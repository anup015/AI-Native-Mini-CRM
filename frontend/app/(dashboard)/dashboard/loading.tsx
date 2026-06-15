import { CustomerProfileSkeleton } from "@/components/customers/customer-skeletons";

export default function Loading() {
  return (
    <div className="space-y-4">
      <CustomerProfileSkeleton />
    </div>
  );
}
