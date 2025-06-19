import { sql } from "drizzle-orm";
import {
  pgTable,
  integer,
  text,
  jsonb,
  serial,
  timestamp,
  bigint,
  index,
} from "drizzle-orm/pg-core";

const advocates = pgTable(
  "advocates",
  {
    id: serial("id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    city: text("city").notNull(),
    degree: text("degree").notNull(),
    specialties: jsonb("payload").default([]).notNull(),
    yearsOfExperience: integer("years_of_experience").notNull(),
    phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      // Create indexes for text search fields
      firstNameIdx: index("idx_first_name").on(table.firstName),
      lastNameIdx: index("idx_last_name").on(table.lastName),
      cityIdx: index("idx_city").on(table.city),
      degreeIdx: index("idx_degree").on(table.degree),

      // Index for years of experience filtering
      yearsExpIdx: index("idx_years_experience").on(table.yearsOfExperience),
};
  }
);

export { advocates };
