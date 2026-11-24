"use client";

import CountryVisaQuiz from "@/components/CountryVisaQuiz";
import { deQuizConfig } from "@/data/quizzes/de";

export default function DEPage() {
  return <CountryVisaQuiz config={deQuizConfig} />;
}