import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({ open, title, onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="bg-white dark:bg-neutral-900 text-black dark:text-white opacity-100 shadow-xl border border-gray-300 dark:border-neutral-700 rounded-xl max-w-md p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </DialogFooter>
        <DialogDescription className="sr-only">
            This dialog is used in confirm situations.
          </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
