"use client";

import CountryVisaQuiz from "@/components/CountryVisaQuiz";
import { nlQuizConfig } from "@/data/quizzes/nl";

export default function NLPage() {
  return <CountryVisaQuiz config={nlQuizConfig} />;
}