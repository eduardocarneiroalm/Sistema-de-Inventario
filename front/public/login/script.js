const form = document.getElementById("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    const resposta = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        alert("Usuário ou senha incorretos!");
        return;
    }
    

    localStorage.setItem("tipoUsuario", dados.tipo);

    window.location.href = "/inventario/index.html";
});

document.getElementById("souMembro").addEventListener("click", () => {
    localStorage.setItem("tipoUsuario", "membro");
    window.location.href = "/inventario/index.html";
});
