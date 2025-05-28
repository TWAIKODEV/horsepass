CREATE TABLE "caballos" (
	"id" serial PRIMARY KEY NOT NULL,
	"ueln" varchar(15) NOT NULL,
	"microchip" varchar(23) NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"fecha_nacimiento" date NOT NULL,
	"sexo" varchar(10) NOT NULL,
	"raza" varchar(100) NOT NULL,
	"capa" varchar(50) NOT NULL,
	"pais_origen" varchar(50) NOT NULL,
	"id_explotacion" integer,
	"id_propietario" integer,
	"fecha_registro" timestamp DEFAULT now(),
	"activo" boolean DEFAULT true,
	CONSTRAINT "caballos_ueln_unique" UNIQUE("ueln"),
	CONSTRAINT "caballos_microchip_unique" UNIQUE("microchip")
);
--> statement-breakpoint
CREATE TABLE "certificados_salud" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_caballo" integer,
	"numero_certificado" varchar(50) NOT NULL,
	"fecha_emision" date NOT NULL,
	"fecha_validez" date NOT NULL,
	"id_veterinario" integer,
	"resultado" varchar(30) NOT NULL,
	"observaciones" text,
	"vacunas_aplicadas" text,
	"pruebas_realizadas" text,
	"url_documento" varchar(255),
	"fecha_registro" timestamp DEFAULT now(),
	CONSTRAINT "certificados_salud_numero_certificado_unique" UNIQUE("numero_certificado")
);
--> statement-breakpoint
CREATE TABLE "documentos_transporte_ue" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_caballo" integer,
	"numero_documento" varchar(50) NOT NULL,
	"fecha_emision" date NOT NULL,
	"pais_origen" varchar(50) NOT NULL,
	"pais_destino" varchar(50) NOT NULL,
	"punto_control_fronterizo" varchar(100),
	"id_certificado_salud" integer,
	"id_guia_movimiento" integer,
	"url_documento" varchar(255),
	"fecha_registro" timestamp DEFAULT now(),
	"id_emisor" integer,
	CONSTRAINT "documentos_transporte_ue_numero_documento_unique" UNIQUE("numero_documento")
);
--> statement-breakpoint
CREATE TABLE "explotaciones" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo_rega" varchar(50) NOT NULL,
	"nombre" varchar(200) NOT NULL,
	"direccion" text NOT NULL,
	"municipio" varchar(100) NOT NULL,
	"provincia" varchar(100) NOT NULL,
	"codigo_postal" varchar(10) NOT NULL,
	"telefono" varchar(20) NOT NULL,
	"email" varchar(100),
	"tipo_explotacion" varchar(20) NOT NULL,
	"capacidad_maxima" integer NOT NULL,
	"fecha_registro" timestamp DEFAULT now(),
	"id_propietario" integer,
	"activa" boolean DEFAULT true,
	CONSTRAINT "explotaciones_codigo_rega_unique" UNIQUE("codigo_rega")
);
--> statement-breakpoint
CREATE TABLE "guias_movimiento" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_caballo" integer,
	"numero_guia" varchar(50) NOT NULL,
	"fecha_emision" date NOT NULL,
	"explotacion_origen" integer,
	"explotacion_destino" integer,
	"fecha_salida" timestamp NOT NULL,
	"fecha_llegada" timestamp,
	"motivo_traslado" text NOT NULL,
	"medio_transporte" varchar(100) NOT NULL,
	"matricula_vehiculo" varchar(20),
	"id_transportista" integer,
	"estado" varchar(20) NOT NULL,
	"url_documento" varchar(255),
	"fecha_registro" timestamp DEFAULT now(),
	"id_emisor" integer,
	CONSTRAINT "guias_movimiento_numero_guia_unique" UNIQUE("numero_guia")
);
--> statement-breakpoint
CREATE TABLE "libros_registro" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_explotacion" integer,
	"fecha_apertura" date NOT NULL,
	"fecha_ultima_actualizacion" timestamp DEFAULT now(),
	"url_documento" varchar(255),
	"observaciones" text,
	"id_responsable" integer
);
--> statement-breakpoint
CREATE TABLE "pasaportes" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_caballo" integer,
	"numero_pasaporte" varchar(50) NOT NULL,
	"fecha_emision" date NOT NULL,
	"autoridad_emisora" varchar(100) NOT NULL,
	"fecha_validez" date,
	"url_documento" varchar(255),
	"estado" varchar(20) NOT NULL,
	"fecha_registro" timestamp DEFAULT now(),
	"id_emisor" integer,
	CONSTRAINT "pasaportes_numero_pasaporte_unique" UNIQUE("numero_pasaporte")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"apellidos" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"tipo_usuario" varchar(20) NOT NULL,
	"num_colegiado" varchar(50),
	"num_licencia_transporte" varchar(50),
	"id_autoridad" varchar(50),
	"fecha_registro" timestamp DEFAULT now(),
	"ultimo_acceso" timestamp,
	"activo" boolean DEFAULT true,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "caballos" ADD CONSTRAINT "caballos_id_explotacion_explotaciones_id_fk" FOREIGN KEY ("id_explotacion") REFERENCES "public"."explotaciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caballos" ADD CONSTRAINT "caballos_id_propietario_users_id_fk" FOREIGN KEY ("id_propietario") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificados_salud" ADD CONSTRAINT "certificados_salud_id_caballo_caballos_id_fk" FOREIGN KEY ("id_caballo") REFERENCES "public"."caballos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificados_salud" ADD CONSTRAINT "certificados_salud_id_veterinario_users_id_fk" FOREIGN KEY ("id_veterinario") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos_transporte_ue" ADD CONSTRAINT "documentos_transporte_ue_id_caballo_caballos_id_fk" FOREIGN KEY ("id_caballo") REFERENCES "public"."caballos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos_transporte_ue" ADD CONSTRAINT "documentos_transporte_ue_id_certificado_salud_certificados_salud_id_fk" FOREIGN KEY ("id_certificado_salud") REFERENCES "public"."certificados_salud"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos_transporte_ue" ADD CONSTRAINT "documentos_transporte_ue_id_guia_movimiento_guias_movimiento_id_fk" FOREIGN KEY ("id_guia_movimiento") REFERENCES "public"."guias_movimiento"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos_transporte_ue" ADD CONSTRAINT "documentos_transporte_ue_id_emisor_users_id_fk" FOREIGN KEY ("id_emisor") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "explotaciones" ADD CONSTRAINT "explotaciones_id_propietario_users_id_fk" FOREIGN KEY ("id_propietario") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guias_movimiento" ADD CONSTRAINT "guias_movimiento_id_caballo_caballos_id_fk" FOREIGN KEY ("id_caballo") REFERENCES "public"."caballos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guias_movimiento" ADD CONSTRAINT "guias_movimiento_explotacion_origen_explotaciones_id_fk" FOREIGN KEY ("explotacion_origen") REFERENCES "public"."explotaciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guias_movimiento" ADD CONSTRAINT "guias_movimiento_explotacion_destino_explotaciones_id_fk" FOREIGN KEY ("explotacion_destino") REFERENCES "public"."explotaciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guias_movimiento" ADD CONSTRAINT "guias_movimiento_id_transportista_users_id_fk" FOREIGN KEY ("id_transportista") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guias_movimiento" ADD CONSTRAINT "guias_movimiento_id_emisor_users_id_fk" FOREIGN KEY ("id_emisor") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "libros_registro" ADD CONSTRAINT "libros_registro_id_explotacion_explotaciones_id_fk" FOREIGN KEY ("id_explotacion") REFERENCES "public"."explotaciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "libros_registro" ADD CONSTRAINT "libros_registro_id_responsable_users_id_fk" FOREIGN KEY ("id_responsable") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pasaportes" ADD CONSTRAINT "pasaportes_id_caballo_caballos_id_fk" FOREIGN KEY ("id_caballo") REFERENCES "public"."caballos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pasaportes" ADD CONSTRAINT "pasaportes_id_emisor_users_id_fk" FOREIGN KEY ("id_emisor") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;