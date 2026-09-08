'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/auth/login");
}
