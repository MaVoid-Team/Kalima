import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function FastBuyClearDialog({ open, onStay, onConfirm }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave fast buy checkout?</AlertDialogTitle>
          <AlertDialogDescription>
            Leaving this page will clear your fast buy cart. You can stay to complete checkout, or leave and start again later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStay}>Stay on checkout</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Leave and clear cart</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
