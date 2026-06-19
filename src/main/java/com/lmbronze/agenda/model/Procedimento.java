package com.lmbronze.agenda.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "procedimentos")
@Data
public class Procedimento {

    @Id
    private String id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private Double preco;

    @Column(nullable = false)
    private String duracao;

    private String descricao;

    @Column(nullable = false)
    private String categoria;
}
