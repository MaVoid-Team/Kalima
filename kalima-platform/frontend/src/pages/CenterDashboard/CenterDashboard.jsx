"use client";

import { useState } from "react";
import CourseFilters from "./CourseFilters";
import CourseList from "./CourseList";
import PromoBanner from "./PromoBanner";
import RecommendedCourses from "./RecommendedCourses";
import StatisticsSection from "./StatisticsSection";
import ActivityTracker from "./ActivityTracker";
import AddCourseForm from "./AddCourseForm";
import QrScannerCard from "./QrScannerCard";

const Dashboard = () => {
  const [filters, setFilters] = useState({
    department: "",
    group: "",
    semester: "",
    teacher: "",
  });

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-6 rtl">
      <div className="mb-6">
        <CourseFilters onFilterChange={handleFilterChange} />
      </div>

      <div className="mb-8">
        <CourseList filters={filters} />
      </div>

      <div className="mb-8">
        <PromoBanner />
      </div>

      <div className="mb-8">
        <AddCourseForm />
      </div>

      <div className="mb-8">
        <RecommendedCourses />
      </div>

     
      <div className="mb-8">
        <QrScannerCard />
      </div>
      <div className="mb-8">
        <ActivityTracker />
      </div>
    </div>
  );
};

export default Dashboard;
