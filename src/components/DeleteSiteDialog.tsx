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
import { useI18n } from "@/lib/i18n";

interface DeleteSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteName: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteSiteDialog({
  open,
  onOpenChange,
  siteName,
  onConfirm,
  isDeleting,
}: DeleteSiteDialogProps) {
  const { t } = useI18n();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-code">{t("deleteSite.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteSite.confirm")} <strong>{siteName}</strong> ? 
            {t("deleteSite.irreversible")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="font-code">{t("deleteSite.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-code"
          >
            {isDeleting ? t("deleteSite.deleting") : t("deleteSite.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}