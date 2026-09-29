package com.MongoSpring.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.*;

import com.MongoSpring.Model.Student;
import com.MongoSpring.service.StudentService;
import org.springframework.web.bind.annotation.CrossOrigin;


@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class MainController {

    @Autowired
    StudentService studentService;

    @Autowired
    MongoTemplate mongoTemplate;

    @GetMapping("/check-db")
    public String checkDatabase() {
        return mongoTemplate.getDb().getName();
    }

    @PostMapping("/addStudent")
    public String addStudent(@RequestBody Student student) {

        studentService.addStudent(student);

        return "Student added Perfectly";
    }

    @GetMapping("/fetchStudents")
    public List<Student> fetchStudent() {

        return studentService.fetchStudents();
    }

    @GetMapping("/getStudent/{id}")
    public Student getStudent(@PathVariable String id) {

        return studentService.getStudent(id);
    }

    @PutMapping("/updateStudent")
    public Student updateStudent(@RequestBody Student student) {
        return studentService.updateStudent(student);
    }

    @DeleteMapping("/deleteStudent/{id}")
    public String deleteStudent(@PathVariable String id) {

        studentService.deleteStudent(id);

        return "Student deleted successfully";
    }
}