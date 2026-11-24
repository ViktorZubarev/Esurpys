"use client";

import CountryVisaQuiz from "@/components/CountryVisaQuiz";
import { usQuizConfig } from "@/data/quizzes/us";

export default function USPage() {
  return <CountryVisaQuiz config={usQuizConfig} />;
}