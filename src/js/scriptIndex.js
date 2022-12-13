// ENDEREÇO EHTEREUM DO CONTRATO
var contractAddress = "0x1d575DD1b04Fbb7584110FAad856525a75DAa3d5";

// Inicializa o objeto DApp
document.addEventListener("DOMContentLoaded", onDocumentLoad);
function onDocumentLoad() {
  DApp.init();
}

// Nosso objeto DApp que irá armazenar a instância web3
const DApp = {
  web3: null,
  contracts: {},
  account: null,

  init: function () {
    return DApp.initWeb3();
  },

  // Inicializa o provedor web3
  initWeb3: async function () {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ // Requisita primeiro acesso ao Metamask
          method: "eth_requestAccounts",
        });
        DApp.account = accounts[0];
        window.ethereum.on('accountsChanged', DApp.updateAccount); // Atualiza se o usuário trcar de conta no Metamaslk
      } catch (error) {
        console.error("Usuário negou acesso ao web3!");
        return;
      }
      DApp.web3 = new Web3(window.ethereum);
    } else {
      console.error("Instalar MetaMask!");
      return;
    }
    return DApp.initContract();
  },

  // Atualiza 'DApp.account' para a conta ativa no Metamask
  updateAccount: async function() {
    DApp.account = (await DApp.web3.eth.getAccounts())[0];
    updateInterface();
  },

  // Associa ao endereço do seu contrato
  initContract: async function () {
    DApp.contracts.DonationSpace = new DApp.web3.eth.Contract(abi, contractAddress);
    return DApp.render();
  },

  // Inicializa a interface HTML com os dados obtidos
  render: async function () {
    updateInterface();
  },
};


// *** MÉTODOS (de consulta - view) DO CONTRATO ** //
function getAllDonations() {
  return DApp.contracts.DonationSpace.methods.getAllDonations().call();
}


// *** MÉTODOS (de escrita) DO CONTRATO ** //
function createDonation() {
  const id = Math.floor(Math.random() * 1000000000);  
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  let goal = document.getElementById("goal").value;
  const userName = document.getElementById("userName").value;

  return DApp.contracts.DonationSpace.methods.createDonation(
      id, 
      title,
      description, 
      goal, 
      userName
  ).send(
      { 
          from: DApp.account
      }
  ).then(() => {
    $('#createDonation').modal('hide');
    updateInterface();
  });
}


// *** ATUALIZAÇÃO DO HTML *** //
function updateInterface() {
  getAllDonations().then(donations => {
    console.log(donations);
    if (donations.length == 0) {
      document.getElementById("donationsTable").style.display = "none";
    } else {
      document.getElementById("emptyDonations").style.display = "none";
      document.getElementById("bodyDonationTable").innerHTML = "";
      donations.forEach(donation => {
        let tr = document.createElement("tr");
        let td1 = document.createElement("td");
        td1.innerHTML = donation['title'];
        let td2 = document.createElement("td");
        td2.innerHTML = donation['description'];
        let td3 = document.createElement("td");  
        td3.innerHTML = donation["goal"];
        let td4 = document.createElement("td");  
        td4.innerHTML = donation["collected"]/1000000000000000000;
        let td5 = document.createElement("td");  
        td5.innerHTML = donation["user"]["name"];
        let td6 = document.createElement("td");
        td6.innerHTML = `<button type='button' class='btn btn-success' onclick='makeDonation(${donation["id"]})'>Doar</button>`;
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);
        tr.appendChild(td6);
        document.getElementById("bodyDonationTable").appendChild(tr);
      });
    }
  });
}

function makeDonation(donationId) {
  sessionStorage.setItem("donationId", donationId);
  location.replace("src/pages/donation-space.html");
}
