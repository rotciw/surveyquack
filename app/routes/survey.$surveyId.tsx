import { json, LoaderFunction } from "@remix-run/cloudflare";
import { Outlet } from "@remix-run/react";
import { supabase } from "~/utils/supabase.server";


export default function SurveyPage() {
    return <div><Outlet/></div>;
}