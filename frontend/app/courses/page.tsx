"use client";

import { useState } from "react";

export default function Courses() {
  const [course, setCourse] = useState("");
  const [courses, setCourses] = useState<string[]>([]);

  const addCourse = () => {
    if (course.trim() === "") return;

    setCourses([...courses, course]);
    setCourse("");
  };

  return (
    <div className="min-h-screen bg-orange-500 flex flex-col items-center p-10">

      <h1 className="text-3xl font-bold text-white mb-6">
        Track Completed Courses
      </h1>

      <div className="bg-white p-6 rounded shadow w-96">

        <input
          type="text"
          placeholder="Enter course (ex: CSCI 3333)"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        <button
          onClick={addCourse}
          className="bg-green-600 text-white p-2 rounded w-full"
        >
          Add Course
        </button>

        <ul className="mt-6">
          {courses.map((c, index) => (
            <li key={index} className="border-b py-2">
              {c}
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}