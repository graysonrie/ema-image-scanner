import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useOnDemandTemplateReorderDialogStore } from "./store/on-demand-template-reorder-dialog-store";

export default function OnDemandTemplateReorderDialog() {
  const { isOpen, setIsOpen } = useOnDemandTemplateReorderDialogStore();

  return <Dialog open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
    
  </Dialog>;
}
