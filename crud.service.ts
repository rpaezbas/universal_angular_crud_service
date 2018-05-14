import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  private baseURL = '';
  data: any[];
  subject = new Subject<any[]>();

  constructor(
    private http: HttpClient) { }

  // This method is called in the beginning to get the copy of the database.
  getEntitiesInDB(): void {
    this.http.get<any[]>(this.baseURL, httpOptions).subscribe(data => this.addEntitiesInMemory(data));
  }

  // This method will be a callback after the http request, this way we keep a copy of the database in memory.
  // It updates the copy of the DB and passes the data to the subsciptors.
  addEntitiesInMemory(data): void {
    this.data = data;
    this.subject.next(this.data);
  }

  // This method is only called to get the details of a single entity, so it doesnt changes the database copy in memory.
  getSingleEntityInDB(id: number): Observable<any> {
    const url = `${this.baseURL}/${id}`;
    return this.http.get<any>(url, httpOptions);
  }

  addEntityInDB(data): void {
    this.http.post<any>(this.baseURL, data, httpOptions).subscribe(newData => this.addSingleEntityInMemory(newData));
  }

  // Adds a new car to the database copy in memory and updates the data for the subscriptors.
  addSingleEntityInMemory(data: any): void {
    this.data.push(data);
    this.subject.next(this.data);
  }

  updateEntityInDB(id: number, data: any): void {
    const url = `${this.baseURL}/${id}`;
    this.http.put<any>(url, data, httpOptions).subscribe(updatedData => {
      this.data = this.data.filter(d => d.id !== id);
      this.data.push(updatedData);
      this.subject.next(this.data);
    });
  }

  deleteEntityInDB(id: number): void {
    const url = `${this.baseURL}/${id}`;
    this.http.delete<any>(url, httpOptions).subscribe(() => {
      this.data = this.data.filter(d => d.id !== id);
      this.subject.next(this.data);
    });
  }
}
