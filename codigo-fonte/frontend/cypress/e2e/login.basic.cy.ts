/// <reference types="cypress" />

const emailInput = 'input[name="email"]';
const passwordInput = 'input[name="password"]';
const esqueceuSenhaLinkText = "Esqueceu sua senha?";
const loginButtonText = "Entrar";

const adminEmail = "admin@safework.com";
const adminSenhaCorreta = "Admin@123";
const adminSenhaErrada = "SenhaErrada123";

describe("Tela de Login", () => {

    beforeEach(() => {
        cy.visit("/");
    })

    const preencherCredenciais = (email: string, senha: string) => {
        cy.get(emailInput).clear().type(email);
        cy.get(passwordInput).clear().type(senha);
    }

    const clicarEntrar = () => {
        cy.contains("button", loginButtonText).click();
    }

    it("deve carregar a página de login com campos e botão", () => {
        cy.contains("Faça login em sua conta").should("be.visible");
        cy.get(emailInput).should("be.visible");
        cy.get(passwordInput).should("be.visible");
        cy.contains(esqueceuSenhaLinkText).should("be.visible");
        cy.contains("button", loginButtonText).should("be.visible");
    });

    it("deve exibir mensagens de erro ao enviar o formulário vazio", () => {
        clicarEntrar();
        cy.contains("Email é obrigatório").should("be.visible");
        cy.contains("Senha é obrigatória").should("be.visible");
    });

    it("deve limpar a mensagem de erro ao digitar", () => {
        clicarEntrar();
        cy.contains("Email é obrigatório").should("be.visible");
        cy.contains("Senha é obrigatória").should("be.visible");
        cy.get(emailInput).type(adminEmail);
        cy.contains("Email é obrigatório").should("not.exist");
        cy.contains("Senha é obrigatória").should("be.visible");
        cy.get(passwordInput).type(adminSenhaCorreta);
        cy.contains("Email é obrigatório").should("not.exist");
        cy.contains("Senha é obrigatória").should("not.exist");
    });

    it("permitir navegar para 'Esqueceu sua senha?'", () => {
        cy.contains(esqueceuSenhaLinkText).click();
        cy.url().should("include", "/forgot-password");
        cy.contains("Recuperar Senha").should("be.visible");
    });

    it("deve realizar login com sucesso e redirecionar para o dashboard", () => {
        preencherCredenciais(adminEmail, adminSenhaCorreta);
        clicarEntrar();
        cy.url().should("include", "/dashboard/home");
        cy.contains("h1", "Dashboard").should("be.visible");
    })

    it("deve exibir mensagem de erro quando a senha estiver incorreta", () => {
        preencherCredenciais(adminEmail, adminSenhaErrada);
        clicarEntrar();
        cy.contains("Email ou senha incorretos").should("be.visible");
    })
});