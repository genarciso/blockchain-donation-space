// ENDEREÇO EHTEREUM DO CONTRATO
var contractAddress = "0x7DE553e814580491C62Cc3DD8BE092aedd7A71Bc";

var donationIdSelected = sessionStorage.getItem("donationId");
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

function getDonation(donationId) {
  return DApp.contracts.DonationSpace.methods.getDonation(donationId).call({ from: DApp.account });
}

function isOwner(donationId) {
    console.log('teste');
  return DApp.contracts.DonationSpace.methods.isOwner(donationId).call({ from: DApp.account }).then((isOwner) => {
    if(isOwner) {
        document.getElementById("finishDonation").style.display = "block";
    } else {
        document.getElementById("finishDonation").style.display = "none";
    }
  });
}

// *** MÉTODOS (de escrita) DO CONTRATO ** //
function doDonatation() {
  const value = document.getElementById("valueDonation").value;

  return DApp.contracts.DonationSpace.methods.donate(
      donationIdSelected
  ).send(
      { 
          from: DApp.account,
          value: value
      }
  );
}

function finishDonation() {
    return DApp.contracts.DonationSpace.methods.finishDonation(donationIdSelected)
        .send({ from: DApp.account})
}


// *** ATUALIZAÇÃO DO HTML *** //
function updateInterface() {
    isOwner(donationIdSelected);
    getDonation(donationIdSelected).then(donation => {
        if(donation === undefined) {
            document.getElementById("donatationCard").style.display = "none";
        } else {
            document.getElementById("emptyDonation").style.display = "none";
            let title = donation["title"];
            let description = donation["description"];
            let user = donation["user"]["name"];
            let collected = donation["collected"]/1000000000000000000;
            let goal = donation["goal"];
            let percentage = parseInt(collected * 100 / goal);
            
            document.getElementById("donationTitle").innerHTML = title;
            document.getElementById("donationDescription").innerHTML = description;
            document.getElementById("donationAuthor").innerHTML = user;
            document.getElementById("donationCollected").innerHTML = `Arrecadado: ${collected}`;
            document.getElementById("donationGoal").innerHTML = `Meta: ${goal}`;
            document.getElementById("progressBar")["aria-valuemax"]=goal;
            document.getElementById("progressBar")["aria-valuenow"]=collected;
            document.getElementById("progressBar").style.width=`${percentage}%`;
            document.getElementById("progressBar").innerHTML=`${percentage}%`;
        }
    });
}

function finishAndExitDonation() {

    return finishDonation().then(() => {
        sessionStorage.clear();
        location.replace("/");
    });
}

function makeDonation() {
    return doDonatation().then(() => {
        document.getElementById("valueDonation").value = ""
        updateInterface();
    })
}