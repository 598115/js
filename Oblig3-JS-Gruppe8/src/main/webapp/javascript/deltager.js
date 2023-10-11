
class DeltagerManager {

    #regElm;
    #statElm;
    #finndeltagerElm;
    #inputElm;
    #inputTagElm;
    #deltagere;
    #besteTidDeltager;
    #besteTid;

    constructor(root) {
        this.#regElm = root.getElementsByClassName("registrering")[0];

        const regButton = this.#regElm.getElementsByTagName("button")[0];
        regButton.addEventListener("click", () => { this.#registrerdeltager() });

        this.#statElm = root.getElementsByClassName("statistikk")[0];
        const statButton = this.#statElm.getElementsByTagName("button")[0];
        statButton.addEventListener("click", () => { this.#beregnstatistikk() });

        this.#finndeltagerElm = root.getElementsByClassName("deltager")[0];
        const deltagerButton = this.#finndeltagerElm.getElementsByTagName("button")[0];
        deltagerButton.addEventListener("click", () => { this.#finndeltager() });
        
        this.#inputElm = this.#regElm.getElementsByClassName("input")[0];
        this.#inputTagElm = this.#inputElm.getElementsByTagName("input")[0];
        this.#deltagere = new Map(); 
                  
    }

    #finndeltager() {
          
    const deltagerElm = this.#finndeltagerElm.getElementsByClassName("input")[0];  
    const inputElm = deltagerElm.getElementsByTagName("input")[0];
     
    const p = this.#finndeltagerElm.getElementsByTagName("p")[0];
    const hidden = this.#finndeltagerElm.getElementsByTagName("dl")[0];
    
        if(!inputElm.value) {
      p.classList.add("hidden");
      hidden.classList.add("hidden");
	  return;
	}
         
    if(inputElm.validity.valid) {
		    		
	   const inputNumber = inputElm.value;
	  
	   const deltager = this.#searchDeltager(String(inputNumber));
	   	   
	   if(deltager == undefined) {
		console.log(inputElm.value)   
		hidden.classList.add("hidden");   
		p.classList.remove("hidden");   
		   return;
	   }   	    
	   const dds = hidden.getElementsByTagName("dd");
	   
	   dds[0].textContent = deltager.nummer;
       dds[1].textContent = deltager.navn;
       dds[2].textContent = deltager.tid;
	   
	   p.classList.add("hidden");	    
	   hidden.classList.remove("hidden");
	   return;
	}
	  p.classList.add("hidden");
      hidden.classList.add("hidden");                 
    }

    #beregnstatistikk() {
        
   const inputElm = this.#statElm.getElementsByClassName("input")[0];    
   const inputs = inputElm.getElementsByTagName("input");
   const result = this.#statElm.getElementsByTagName("p")[0];
    
   let timeFra = inputs[0].value;
   let timeTil = inputs[1].value;
   
   if(!inputs[0].validity.valid || !inputs[1].validity.valid) {
	   result.classList.add("hidden");
	   return;
   }
   
   if(timeFra == '') {
	   timeFra = "00:00:00";
   }
   if(timeTil == '') {
	   timeTil = "23:59:59";
   }
   
    if(timeFra > timeTil) {
		result.classList.add("hidden");
		inputs[0].setCustomValidity("'fra' verdi må være mindre enn 'til' verdi");
		inputs[0].reportValidity();			
		return;
	}
  
    let count = 0;
    
    this.#deltagere.forEach((obj) => {	
		if(obj.tid >= timeFra && obj.tid <= timeTil) {
			count++;
		}	
	});
	
	const text = result.getElementsByTagName("span");
	
	text[0].textContent = count;
	text[1].textContent = timeFra;
	text[2].textContent = timeTil;
			
	result.classList.remove("hidden");	
                  
    }

    #registrerdeltager() {
//-----------------------Uthenting/formattering/validering av registrert info---------------------
		
        const tidReg = /(?:\d{0,2}:){2}\d{0,2}/g;
        const startnummerReg = /\d{1,3}/g;
        const navnReg = /\p{L}{2,}(?:-\p{L}{2,})?/gu;
        
        let inputString = this.#inputElm.getElementsByTagName("input")[0].value;
        
        let tid = inputString.match(tidReg);
        console.log(tid);
        if(this.#validerTid(tid)) {
			return;
		}
		console.log(tid);
		tid = this.#formatTime(tid);
		console.log(tid);
		if(this.#validerTid(tid)) {
			return;
		}
		
        inputString = inputString.replace(tidReg, '');
        let nummer = inputString.match(startnummerReg);
        if(this.#validerNummer(nummer)) {
			return;
		}
        nummer = nummer[0];
		if(this.#validerDeltager(nummer)) {
			return;
		}
        inputString = inputString.replace(startnummerReg, '');
        let navn = inputString.match(navnReg);
        if(this.#validerNavn(navn)) {
			return;
		}
        navn = navn.join(" ");
        inputString = inputString.replace(navnReg, '');
        if(this.#validerTegn(inputString)) {
			return
		}
        
//----------------------------Formattering av store bokstaver navn------------------------------       
                   
    let person = navn.toLocaleLowerCase(navigator.language);
    const navnRegUpperCase = /(^|-|\s)(\p{Ll})/gu;   
    navn.replace(navnReg, '');

    const nynavn = person.replace(navnRegUpperCase,
        (_m, s, tegn) => `${s}${tegn.toLocaleUpperCase(navigator.language)}`
    );
    
//---------------------------Lagring av registrert deltager-------------------------------------
        
    this.#deltagere.set(String(nummer), {navn: nynavn, nummer: nummer, tid: tid[0]});
    console.log(this.#searchDeltager(nummer));
    this.#OppdaterBesteTid(nummer);
    
//---------------Visning av beste tid og fjerning av inskrevet tekst i boks --------------------
    
    this.#regElm.getElementsByTagName("div")[1].classList.remove("hidden");
  
    this.#inputElm.getElementsByTagName("input")[0].value = "";
    this.#inputTagElm.setCustomValidity('');
    this.#inputTagElm.reportValidity();
    const besteTidElm = this.#regElm.getElementsByTagName("div")[1];
    besteTidElm.getElementsByTagName("span")[0].textContent = this.#besteTid;
    
}
    
//---------------------------------------hjelpemetoder-------------------------------------------
   
    #searchDeltager(nummer) {	
	const resultat = this.#deltagere.get(String(nummer));
	return resultat;		
	}
	
	#finnesDeltager(nummer) {		
	const resultat = this.#searchDeltager(nummer);
	if(resultat === undefined) {
		return false;
	}
	return true;		
	}
	
	#validerDeltager(nummer) {
		if(this.#finnesDeltager(String(nummer))) {
			this.#inputTagElm.setCustomValidity(`Startnummer ${nummer} er allerede i bruk`);
            this.#inputTagElm.reportValidity(); 
		    return true;
		}
		return false
	}
	
	#validerTegn(input) {
		input = input.trim();
		if(input == "") {
		return false
		}		
		this.#inputTagElm.setCustomValidity(`Symbol(er) ${input} er ikke tillat`);
        this.#inputTagElm.reportValidity(); 
		return true;
	}
	
	#validerNavn(navn) {		
	
	if(navn == null) {		
        this.#inputTagElm.setCustomValidity("Mangler navn");
        this.#inputTagElm.reportValidity(); 
		return true;
	}		
	else if(navn[1] == undefined) {		
        this.#inputTagElm.setCustomValidity("Mangler etternavn");
        this.#inputTagElm.reportValidity(); 
		return true;
	}
	return false;			
	}
	
	#validerNummer(nummer) {
	
	if(nummer == null) {		
        this.#inputTagElm.setCustomValidity("Mangler gyldig deltagernummer");
        this.#inputTagElm.reportValidity(); 
		return true;
	}						
	else if(nummer[1] != undefined) {
        this.#inputTagElm.setCustomValidity("Kan ikke ha mer enn ett deltagernummer");
        this.#inputTagElm.reportValidity(); 
		return true;
	}
	return false;		
	}
	
	#validerTid(tid) {			
	if(tid == null||tid == "::"||tid <= "00:00:00") {		                                   
        this.#inputTagElm.setCustomValidity("Mangler gyldig sluttid");
        this.#inputTagElm.reportValidity(); 
		return true;
	}
						
	if(tid[1] != undefined) {
        this.#inputTagElm.setCustomValidity("Angi kunn en enkelt slutttid");
        this.#inputTagElm.reportValidity(); 
		return true;
	}
	return false;		
	}
	
	#OppdaterBesteTid(nummer) {
		
	if(this.#besteTidDeltager == undefined || this.#besteTidDeltager == null || this.#besteTidDeltager.tid > this.#searchDeltager(nummer).tid) {
		this.#besteTidDeltager = this.#searchDeltager(nummer);
		this.#besteTid = this.#searchDeltager(nummer).tid;
		return;
	}	
	}
	
	#formatTime(tid) {
		
	const tidSplit = String(tid).split(":");
	
	const tidSplitFormatted = tidSplit.map(part => {
		return part.padStart(2, '0');
	});
	
	return [tidSplitFormatted.join(':')];
	}
}

const rootelement = document.getElementById("root");
new DeltagerManager(rootelement);