"use client";

import CountryVisaQuiz from "@/components/CountryVisaQuiz";
import { caQuizConfig } from "@/data/quizzes/ca";

export default function CAPage() {
  return <CountryVisaQuiz config={caQuizConfig} />;
}