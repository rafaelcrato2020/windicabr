import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { referralCode, userId } = await request.json()

    if (!referralCode || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Find the referrer based on their unique referral code
    const { data: referrer, error: referrerError } = await supabase
      .from("profiles")
      .select("id, referral_count")
      .eq("unique_referral_code", referralCode)
      .single()

    if (referrerError || !referrer) {
      console.error("Error finding referrer:", referrerError)
      return NextResponse.json({ error: "Invalid referral code" }, { status: 400 })
    }

    // Update the referrer's referral count
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        referral_count: (referrer.referral_count || 0) + 1,
      })
      .eq("id", referrer.id)

    if (updateError) {
      console.error("Error updating referrer count:", updateError)
      return NextResponse.json({ error: "Failed to update referrer" }, { status: 500 })
    }

    // Update the new user's profile to link to their referrer
    const { error: userUpdateError } = await supabase
      .from("profiles")
      .update({ referred_by: referrer.id })
      .eq("id", userId)

    if (userUpdateError) {
      console.error("Error linking user to referrer:", userUpdateError)
      return NextResponse.json({ error: "Failed to link user to referrer" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing referral:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
