package com.MongoSpring.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.MongoSpring.Model.Student;
import com.MongoSpring.Repository.StudentRepo;

@Service
public class StudentService {

    @Autowired
    StudentRepo studentRepo;

    // Add Student
    public Student addStudent(Student student) {
        return studentRepo.save(student);
    }

    // Get All Students
    public List<Student> fetchStudents() {
        return studentRepo.findAll();
    }

    // Get Student By ID
    public Student getStudent(String id) {
        return studentRepo.findById(id).orElse(null);
    }

    // Update Student
    public Student updateStudent(Student student) {

        // Find existing student using MongoDB ID
        Student existingStudent =
                studentRepo.findById(student.getId()).orElse(null);

        if (existingStudent == null) {
            return null;
        }

        // Update only editable fields
        existingStudent.setRno(student.getRno());
        existingStudent.setName(student.getName());
        existingStudent.setAddress(student.getAddress());
        existingStudent.setDepatment(student.getDepatment());

        // Save existing document
        return studentRepo.save(existingStudent);
    }

    // Delete Student
    public void deleteStudent(String id) {
        studentRepo.deleteById(id);
    }
}