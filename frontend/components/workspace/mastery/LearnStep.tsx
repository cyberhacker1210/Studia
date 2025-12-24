'use client';

import { masteryStart } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCourseById, Course } from '@/lib/courseService';
import { useState, useEffect } from 'react';

export default function CourseDisplay() {
    const { id } = useParams();
    const { user } = useUser();
    const [course, setCourse] = useState(null);
    const [learnStep, setLearnStep] = useState(null);

    useEffect(() => {
        if (user && id) {
            getCourseById(Number(id), user.id).then(data => {
                setCourse(data);
            });
        }
    }, [user, id]);

    useEffect(() => {
        if (course && course.extracted_text && course.subject) {
            masteryStart(course.extracted_text, course.subject).then(data => {
                setLearnStep(data);
            });
        }
    }, [course]);

    return (
        learnStep !== null ?
            <div>{learnStep}</div> :
            <div>Loading...</div>
    );
}