import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Student } from './model/student';
import { StudentService } from './service/student.service';

export type ThemeMode = 'light' | 'dark' | 'warm';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  // COLOR THEME MODE ('light' | 'dark' | 'warm')
  currentTheme: ThemeMode = 'light';

  // COMMON HELPER & INITIAL STATE
  private createEmptyStudent(): Student {
    return {
      rno: '',
      name: '',
      address: '',
      depatment: ''
    };
  }

  constructor(private studentService: StudentService) { }

  ngOnInit(): void {
    // Restore preferred theme mode
    try {
      const savedTheme = localStorage.getItem('student_ui_theme') as ThemeMode;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'warm')) {
        this.setTheme(savedTheme);
      } else {
        this.setTheme('light');
      }
    } catch {
      this.setTheme('light');
    }

    this.loadStudents();
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme = theme;
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
    }
    try {
      localStorage.setItem('student_ui_theme', theme);
    } catch (e) {
      console.warn('Could not save theme to localStorage:', e);
    }
  }

  // READ (GET ALL STUDENTS)
  students: Student[] = [];
  isLoading: boolean = false;
  searchTerm: string = '';
  selectedDepartment: string = 'ALL';

  // PAGINATION STATE (Default: 5 students per screen)
  currentPage: number = 1;
  pageSize: number = 5;

  loadStudents(): void {
    this.isLoading = true;
    this.studentService.getStudents().subscribe({
      next: (data) => {
        this.students = data || [];
        this.isLoading = false;
        console.log('Students:', data);
        // Ensure currentPage is valid after reloading
        if (this.currentPage > this.totalPages) {
          this.currentPage = Math.max(1, this.totalPages);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching students:', error);
      }
    });
  }

  // FILTERED LIST BASED ON SEARCH & DEPARTMENT
  get filteredStudents(): Student[] {
    return this.students.filter(student => {
      const term = (this.searchTerm || '').trim().toLowerCase();
      const matchesSearch = !term ||
        (student.name && student.name.toLowerCase().includes(term)) ||
        (student.rno && student.rno.toString().toLowerCase().includes(term)) ||
        (student.address && student.address.toLowerCase().includes(term)) ||
        (student.depatment && student.depatment.toLowerCase().includes(term));

      const matchesDept = this.selectedDepartment === 'ALL' ||
        (student.depatment && student.depatment.trim().toLowerCase() === this.selectedDepartment.trim().toLowerCase());

      return matchesSearch && matchesDept;
    });
  }

  // PAGINATED STUDENTS (Only 5 students shown per screen)
  get paginatedStudents(): Student[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredStudents.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    const total = this.filteredStudents.length;
    return Math.ceil(total / this.pageSize) || 1;
  }

  get startIndex(): number {
    if (this.filteredStudents.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredStudents.length);
  }

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const range: number[] = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      range.unshift(-1); // indicator for ellipsis '...'
    }
    if (current + delta < total - 1) {
      range.push(-1); // indicator for ellipsis '...'
    }

    range.unshift(1);
    if (total > 1) {
      range.push(total);
    }

    return range;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  get departmentList(): string[] {
    const deptSet = new Set<string>();
    this.students.forEach(s => {
      if (s.depatment && s.depatment.trim()) {
        deptSet.add(s.depatment.trim());
      }
    });
    return Array.from(deptSet).sort();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.selectedDepartment = 'ALL';
    this.currentPage = 1;
  }

  getInitials(name: string): string {
    if (!name || !name.trim()) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): string {
    const gradients = [
      'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
      'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      'linear-gradient(135deg, #db2777 0%, #f43f5e 100%)',
      'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)'
    ];
    if (!name) return gradients[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  }

  // CREATE (ADD STUDENT)
  showAddDialog: boolean = false;
  newStudent: Student = this.createEmptyStudent();
  addErrors = {
    rno: '',
    name: '',
    depatment: '',
    address: ''
  };

  validateAddStudent(): boolean {
    this.addErrors = { rno: '', name: '', depatment: '', address: '' };
    let isValid = true;

    const rnoVal = (this.newStudent.rno !== null && this.newStudent.rno !== undefined)
      ? this.newStudent.rno.toString().trim()
      : '';

    if (!rnoVal) {
      this.addErrors.rno = 'Roll number is required';
      isValid = false;
    } else if (this.students.some(s => s.rno?.toString().trim() === rnoVal)) {
      this.addErrors.rno = 'Roll number already exists';
      isValid = false;
    }

    if (!this.newStudent.name || !this.newStudent.name.trim()) {
      this.addErrors.name = 'Student name is required';
      isValid = false;
    }

    if (!this.newStudent.depatment || !this.newStudent.depatment.trim()) {
      this.addErrors.depatment = 'Department is required';
      isValid = false;
    }

    if (!this.newStudent.address || !this.newStudent.address.trim()) {
      this.addErrors.address = 'Address is required';
      isValid = false;
    }

    return isValid;
  }

  openAddDialog(): void {
    this.newStudent = this.createEmptyStudent();
    this.addErrors = { rno: '', name: '', depatment: '', address: '' };
    this.showAddDialog = true;
  }

  closeAddDialog(): void {
    this.showAddDialog = false;
    this.addErrors = { rno: '', name: '', depatment: '', address: '' };
  }

  addStudent(): void {
    if (!this.validateAddStudent()) {
      return;
    }

    this.studentService.addStudent(this.newStudent).subscribe({
      next: (response) => {
        console.log('Student added:', response);
        this.showAddDialog = false;
        this.loadStudents();
        this.newStudent = this.createEmptyStudent();
      },
      error: (error) => {
        console.error('Error adding student:', error);
        alert('Student add nahi hua');
      }
    });
  }

  // UPDATE (EDIT STUDENT)
  showUpdateDialog: boolean = false;
  selectedStudent: Student = this.createEmptyStudent();
  updateErrors = {
    name: '',
    depatment: '',
    address: ''
  };

  validateUpdateStudent(): boolean {
    this.updateErrors = { name: '', depatment: '', address: '' };
    let isValid = true;

    if (!this.selectedStudent.name || !this.selectedStudent.name.trim()) {
      this.updateErrors.name = 'Student name is required';
      isValid = false;
    }

    if (!this.selectedStudent.depatment || !this.selectedStudent.depatment.trim()) {
      this.updateErrors.depatment = 'Department is required';
      isValid = false;
    }

    if (!this.selectedStudent.address || !this.selectedStudent.address.trim()) {
      this.updateErrors.address = 'Address is required';
      isValid = false;
    }

    return isValid;
  }

  openUpdateDialog(student: Student): void {
    // Original table data mutate na ho isliye shallow copy banayi hai
    this.selectedStudent = {
      id: student.id,
      rno: student.rno,
      name: student.name,
      address: student.address,
      depatment: student.depatment
    };
    this.updateErrors = { name: '', depatment: '', address: '' };
    this.showUpdateDialog = true;
  }

  closeUpdateDialog(): void {
    this.showUpdateDialog = false;
    this.updateErrors = { name: '', depatment: '', address: '' };
  }

  updateStudent(): void {
    if (!this.validateUpdateStudent()) {
      return;
    }

    console.log('Updating student:', this.selectedStudent);

    this.studentService.updateStudent(this.selectedStudent).subscribe({
      next: (response) => {
        console.log('Student updated:', response);
        this.showUpdateDialog = false;
        this.loadStudents();
      },
      error: (error) => {
        console.error('Error updating student:', error);
        alert('Student update nahi hua');
      }
    });
  }

  // DELETE (REMOVE STUDENT)
  showDeleteDialog: boolean = false;
  selectedDeleteStudent: Student = this.createEmptyStudent();

  openDeleteDialog(student: Student): void {
    const studentAny = student as any;
    const studentId = student.id || studentAny._id || student.rno;

    this.selectedDeleteStudent = {
      id: studentId,
      rno: student.rno,
      name: student.name,
      address: student.address,
      depatment: student.depatment
    };

    this.showDeleteDialog = true;
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
  }

  deleteStudent(id?: string): void {
    console.log('deleteStudent called with id:', id);
    console.log('selectedDeleteStudent is:', this.selectedDeleteStudent);

    // Backend endpoint expects @PathVariable String id
    const targetId = id || this.selectedDeleteStudent.id || this.selectedDeleteStudent.rno;

    if (!targetId) {
      console.warn('Student ID nahi mila!');
      alert('Student ID nahi mila');
      return;
    }

    console.log('Deleting student with id:', targetId);

    this.studentService.deleteStudent(targetId).subscribe({
      next: (response) => {
        console.log('Student deleted successfully:', response);
        this.showDeleteDialog = false;
        this.loadStudents();
      },
      error: (error) => {
        console.error('Error deleting student:', error);
        const statusMsg = error.status
          ? `Status ${error.status} - ${error.statusText || ''}`
          : (error.message || 'Network error');
        alert('Student delete nahi hua: ' + statusMsg);
      }
    });
  }

}