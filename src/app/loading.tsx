import { RupeeLoader } from "@/components/ui/rupee-loader";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pp-bg">
      <RupeeLoader />
    </div>
  );
}
