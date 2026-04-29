-- Align deployed databases that already ran earlier migrations with the                                                    
-- current Prisma schema. These statements are idempotent so deploys are safe                                               
-- on databases that were previously repaired manually.       
                                                              
DO $$                                                         
BEGIN                                                         
  CREATE TYPE "user_flag_enum" AS ENUM ('NORMAL', 'SUSPICIOUS'
, 'BANNED');                                                  
EXCEPTION                                                     
  WHEN duplicate_object THEN NULL;                            
END $$;                                                       
                                                              
ALTER TABLE "users"                                           
ADD COLUMN IF NOT EXISTS "flag" "user_flag_enum" DEFAULT 'NORM
AL';                                                          
                                                              
UPDATE "users"                                                
SET "flag" = 'NORMAL'                                         
WHERE "flag" IS NULL;                                         
                                                              
ALTER TABLE "users"                                           
ALTER COLUMN "flag" SET DEFAULT 'NORMAL',                     
ALTER COLUMN "flag" SET NOT NULL;                             
                                                              
ALTER TABLE "samples"                                         
ADD COLUMN IF NOT EXISTS "title" VARCHAR(255);                