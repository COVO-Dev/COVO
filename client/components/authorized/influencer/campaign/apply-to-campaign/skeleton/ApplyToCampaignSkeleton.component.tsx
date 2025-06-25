import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function ApplyToCampaignFormSkeleton() {
  return (
    <div>
      <div className="space-y-8 max-w-3xl mx-auto py-10">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[30%]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[30%]" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
        </div>

        <div>
          <Skeleton className="h-6 w-[100px]" />
        </div>
      </div>
    </div>
  );
}

export default ApplyToCampaignFormSkeleton;