import { prisma } from "../../../libs/db/prisma";
import { EBookletAccessCodeService } from "./e-booklet-access-code.service";
import { EBookletMilestoneService } from "./e-booklet-milestone.service";
import { EBookletRedemptionService } from "./e-booklet-redemption.service";
import { EBookletSettingsService } from "./e-booklet-settings.service";
import { EBookletTermsService } from "./e-booklet-terms.service";
import { TeacherWalletService } from "./teacher-wallet.service";

export function getEBookletDomainServices(db: any = prisma) {
  return {
    terms: new EBookletTermsService(db),
    accessCodes: new EBookletAccessCodeService(db),
    redemptions: new EBookletRedemptionService(db),
    settings: new EBookletSettingsService(db),
    milestones: new EBookletMilestoneService(db),
    wallet: new TeacherWalletService(db),
  };
}
