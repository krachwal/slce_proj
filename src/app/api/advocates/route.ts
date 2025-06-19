import db from "../../../db";
import { advocates } from "../../../db/schema";
import { or, ilike, sql, gte } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    // Build search conditions
    let whereConditions = undefined;
    if (search) {
      // Check if search term is a number (for years of experience filter)
      const searchAsNumber = !isNaN(Number(search)) ? Number(search) : null;

      if (searchAsNumber !== null) {
        // If search is a number, include years of experience filter
        whereConditions = or(
          ilike(advocates.firstName, `%${search}%`),
          ilike(advocates.lastName, `%${search}%`),
          ilike(advocates.city, `%${search}%`),
          ilike(advocates.degree, `%${search}%`),
          // Search within the JSON array using PostgreSQL's JSON operators
          sql`EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(${advocates.specialties}) AS specialty
            WHERE specialty ILIKE ${`%${search}%`}
          )`,
          // Filter by years of experience greater than or equal to the search number
          gte(advocates.yearsOfExperience, searchAsNumber)
        );
      } else {
        // Regular text search without years filter
        whereConditions = or(
          ilike(advocates.firstName, `%${search}%`),
          ilike(advocates.lastName, `%${search}%`),
          ilike(advocates.city, `%${search}%`),
          ilike(advocates.degree, `%${search}%`),
          // Search within the JSON array using PostgreSQL's JSON operators
          sql`EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(${advocates.specialties}) AS specialty
            WHERE specialty ILIKE ${`%${search}%`}
          )`
        );
      }
    }

    // Execute the main query
    const data = await db
      .select()
      .from(advocates)
      .where(whereConditions)
      .limit(limit)
      .offset(offset);

    // Count total records
    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(advocates)
      .where(whereConditions);

    const total = countResult[0]?.count ? Number(countResult[0].count) : 0;

    return Response.json({
      data,
      meta: {
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching advocates:", error);
    return Response.json({ error: "Failed to fetch advocates" }, { status: 500 });
  }
}
