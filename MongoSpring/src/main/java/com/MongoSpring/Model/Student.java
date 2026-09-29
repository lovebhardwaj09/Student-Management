package com.MongoSpring.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;


@Document(collection = "students") 
@Data
public class Student {
    @Id
    private String id;

    private Integer rno;

    private String name ;

    private  String address;

    private  String depatment;
    

}
