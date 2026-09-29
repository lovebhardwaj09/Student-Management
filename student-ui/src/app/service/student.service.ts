import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../model/student';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}
  
  // add new student
  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/fetchStudents`);
  }

   // POST new student
  addStudent(student: Student): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/addStudent`,
      student,
      { responseType: 'text' }
    );
  }

    // PUT
  updateStudent(student: Student): Observable<Student> {
    return this.http.put<Student>(
      `${this.apiUrl}/updateStudent`,
      student
    );
  }

  // DELETE
  deleteStudent(idOrRno: string | number): Observable<string> {
    return this.http.delete(
      `${this.apiUrl}/deleteStudent/${idOrRno}`,
      { responseType: 'text' }
    );
  }
}