CREATE TABLE IF NOT EXISTS "BLOOD" (
	"blood_id" varchar PRIMARY KEY NOT NULL,
	"blood_type" varchar,
	"delivery_id" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DELIVERY_PARTICIPATION" (
	"delivery_id" varchar,
	"user_id" varchar,
	CONSTRAINT "DELIVERY_PARTICIPATION_delivery_id_user_id_pk" PRIMARY KEY("delivery_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DELIVERY" (
	"delivery_id" varchar PRIMARY KEY NOT NULL,
	"drone_id" varchar,
	"blood_id" varchar,
	"hospital_id" varchar,
	"center_id" varchar,
	"dte_delivery" timestamp,
	"dte_validation" timestamp,
	"delivery_status" text,
	"delivery_urgent" boolean
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DONATIONCENTER" (
	"center_id" varchar PRIMARY KEY NOT NULL,
	"center_city" varchar,
	"center_postal" integer,
	"center_adress" varchar,
	"center_latitude" integer,
	"center_longitude" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DRONE" (
	"drone_id" varchar PRIMARY KEY NOT NULL,
	"drone_name" varchar,
	"center_id" varchar,
	"drone_status" text,
	"drone_current_lat" integer,
	"drone_current_long" integer,
	"drone_battery" text,
	"drone_image" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "HOSPITAL" (
	"hospital_id" varchar PRIMARY KEY NOT NULL,
	"hospital_name" varchar,
	"hospital_city" varchar,
	"hospital_postal" integer,
	"hospital_adress" varchar,
	"hospital_latitude" integer,
	"hospital_longtitude" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "USER" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"user_name" varchar,
	"user_firstname" varchar,
	"dte_create" timestamp DEFAULT now(),
	"tel_number" integer,
	"user_status" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_donation_center" (
	"user_id" integer,
	"center_id" integer,
	"admin" boolean,
	"info" varchar,
	CONSTRAINT "user_donation_center_user_id_pk" PRIMARY KEY("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_dronist" (
	"user_id" varchar,
	"info" varchar,
	CONSTRAINT "user_dronist_user_id_pk" PRIMARY KEY("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_hospital" (
	"user_id" integer,
	"hospital_id" integer,
	"admin" boolean,
	"info" varchar,
	CONSTRAINT "user_hospital_user_id_pk" PRIMARY KEY("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_support_relationship_center" (
	"user_id" varchar,
	"info" varchar,
	CONSTRAINT "user_support_relationship_center_user_id_pk" PRIMARY KEY("user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BLOOD" ADD CONSTRAINT "BLOOD_delivery_id_DELIVERY_delivery_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "DELIVERY"("delivery_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DELIVERY_PARTICIPATION" ADD CONSTRAINT "DELIVERY_PARTICIPATION_delivery_id_DELIVERY_delivery_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "DELIVERY"("delivery_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DELIVERY_PARTICIPATION" ADD CONSTRAINT "DELIVERY_PARTICIPATION_user_id_USER_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "USER"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DELIVERY" ADD CONSTRAINT "DELIVERY_drone_id_DRONE_drone_id_fk" FOREIGN KEY ("drone_id") REFERENCES "DRONE"("drone_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DELIVERY" ADD CONSTRAINT "DELIVERY_hospital_id_HOSPITAL_hospital_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "HOSPITAL"("hospital_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DELIVERY" ADD CONSTRAINT "DELIVERY_center_id_DONATIONCENTER_center_id_fk" FOREIGN KEY ("center_id") REFERENCES "DONATIONCENTER"("center_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DRONE" ADD CONSTRAINT "DRONE_center_id_DONATIONCENTER_center_id_fk" FOREIGN KEY ("center_id") REFERENCES "DONATIONCENTER"("center_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_donation_center" ADD CONSTRAINT "user_donation_center_user_id_USER_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "USER"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_donation_center" ADD CONSTRAINT "user_donation_center_center_id_DONATIONCENTER_center_id_fk" FOREIGN KEY ("center_id") REFERENCES "DONATIONCENTER"("center_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_dronist" ADD CONSTRAINT "user_dronist_user_id_USER_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "USER"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_hospital" ADD CONSTRAINT "user_hospital_user_id_USER_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "USER"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_hospital" ADD CONSTRAINT "user_hospital_hospital_id_HOSPITAL_hospital_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "HOSPITAL"("hospital_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_support_relationship_center" ADD CONSTRAINT "user_support_relationship_center_user_id_USER_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "USER"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
