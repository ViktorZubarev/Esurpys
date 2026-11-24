"use client";

import CountryVisaQuiz from "@/components/CountryVisaQuiz";
import { ukQuizConfig } from "@/data/quizzes/uk";

export default function UKPage() {
  return <CountryVisaQuiz config={ukQuizConfig} />;
}