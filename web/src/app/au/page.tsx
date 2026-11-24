"use client";

import CountryVisaQuiz from "@/components/CountryVisaQuiz";
import { auQuizConfig } from "@/data/quizzes/au";

export default function AUPage() {
  return <CountryVisaQuiz config={auQuizConfig} />;
}