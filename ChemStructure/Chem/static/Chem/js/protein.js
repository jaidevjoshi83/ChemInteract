let NewView  = null
let edit 


document.addEventListener('DOMContentLoaded', function () {
    let element = document.querySelector('#container-01');
    if (element) {
        let config = { backgroundColor: 'white' };
        let viewer = $3Dmol.createViewer(element, config);

        loadFile()
        loadPDBQuery()

        const clean_pdbdata = ''

        viewer.addModel(clean_pdbdata, "pdb");
        const allAtoms  = viewer.getModel().selectedAtoms({});

        saveChanges(viewer)

        editor.setValue('');
        editor.setValue(viewer.pdbData())

        const residueIdsToExclude = [408, 409]; // Replace with your desired residue IDs
        const filteredAtoms = allAtoms.filter(atom => !residueIdsToExclude.includes(atom.resi));

        viewer.setStyle({ resn: "HOH", invert: true }, { cartoon: { color: 'spectrum' } }); 
        viewer.setStyle({ hetflag: true }, { stick: { colorscheme: 'greenCarbon' } });

        viewer.setClickable({}, true, function (atom, viewer, event, container) {
        const labelId = atom.resn + ":" + atom.resi;
    
            if (viewer[labelId]) {
                viewer.removeLabel(viewer[labelId]);
                delete viewer[labelId]; // Clear the reference
            } else {
                viewer[labelId] = viewer.addLabel(labelId, {
                    position: { x: atom.x, y: atom.y, z: atom.z },
                    backgroundColor: 'darkgreen',
                    backgroundOpacity: 0.8,
                    fontColor: 'white'
                });
            }
        });

        viewer.zoomTo(); // Focus on the entire structure
        viewer.render(); // Render the scene
        NewView = viewer
    };
});

var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    lineNumbers: true, // Display line numbers
    mode: 'javascript', // Set language mode
    theme: 'dracula', // Set theme
    lineWrapping: true, // Enable line wrapping

});

editor.setSize(1000, 700);
editor.setValue("")
    
    
function chain_drop_down(chainList, viewer){

   const mainDropdown = document.querySelector("#dropdownMenu")
   mainDropdown.innerHTML = "";

   const chains =  document.createElement('div')
   chains.className = "chain-dropdown"

   const chainDropdownName = document.createElement('span')
   chainDropdownName.textContent = "All Chains"

   const chainDropdownSelect = document.createElement('input')
   chainDropdownSelect.type = 'checkbox'
   chainDropdownSelect.className = 'chain-Dropdown-Select'

   const allChainsDiv = document.createElement('div')
   allChainsDiv.className  = 'all-chains-div'
   allChainsDiv.style.display = 'block'

   chains.append(chainDropdownName)
   chains.append(chainDropdownSelect)
   chains.style.marginLeft = '5px'
 
    chainList.forEach(chain =>{

        const chainElement  = document.createElement('div')
        chainElement.className = "chain-element"

        const chainName = document.createElement('span')
        chainName.className = 'chain-name'
        chainName.dataset.value = chain;

        const chainSelect = document.createElement('input')
        chainSelect.type = 'checkbox'
        chainSelect.className = 'chain-select'
        chainSelect.value = chain

        const icon  = document.createElement("i")
        icon.className = "fas fa-trash"
        icon.textContent = `Chain ${chain}`
        chainName.append(icon)
        chainName.append(chainSelect)

        deleteChain(icon, chain, viewer)

        chainElement.append(chainName)
        allChainsDiv.append(chainElement)
    })

    chains.append(allChainsDiv)

    chainDropdownName.addEventListener('click', ()=>{
        if (allChainsDiv.style.display == 'none'){
            allChainsDiv.style.display = 'block'
        } else{
            allChainsDiv.style.display = 'none'
        }
    })
    mainDropdown.append(chains)
}

function deleteChain(element, chain, viewer) {
    element.addEventListener('click', ()=>{
        const allAtoms  = viewer.getModel().selectedAtoms({});
        const filteredAtoms = allAtoms.filter(atom => atom.chain !== chain);
        viewer.removeAllModels()
        const newModel = viewer.addModel();
        newModel.addAtoms(filteredAtoms );
        NewView = viewer
        NewView.zoomTo(); 
        NewView.render(); 
        element.parentElement.parentElement.remove()
        // edit_text(viewer.pdbData())
        editor.setValue('');
        editor.setValue(viewer.pdbData())

    })
}

function deleteResidue(element, res_id, viewer) {
    const residueIdsToExclude =[parseInt(res_id)]
    element.addEventListener('click', ()=>{
        const allAtoms  = viewer.getModel().selectedAtoms({});
        const filteredAtoms = allAtoms.filter(atom => !residueIdsToExclude.includes(atom.resi));
        viewer.removeAllModels();
        const newModel = viewer.addModel();
        newModel.addAtoms(filteredAtoms );
        NewView = viewer
        NewView.zoomTo(); 
        NewView.render(); 
        element.parentElement.parentElement.remove()
        editor.setValue('');
        editor.setValue(viewer.pdbData())

    })
}

function download_pdb(viewer) {
    const downloadButton = document.querySelector('#delete-res')

    downloadButton.addEventListener('click', ()=>{
        if (NewView) {
            pdbData = NewView.pdbData();
        } else{
            pdbData = viewer.pdbData();
        }

        const base64String = btoa(pdbData);

        // Prepare the JSON data with base64 encoded pdbData
        const data = JSON.stringify({ pdb_data: base64String });

        // Send a POST request to upload the PDB data
        fetch('http://127.0.0.1:8000/write_pdb_file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data
        })
        .then(response => response.json())
        .then(data => {
            console.log('File uploaded successfully:', data);
        })
        .catch(error => {
            console.error('Error uploading file:', error);
        });
    })
}

function get_chains(allAtoms) {

    let chains = new Set(); 
    
    allAtoms.forEach(atom => {
        if (atom.chain) {
            chains.add(atom.chain); 
        }
    });
    
    let chainList = Array.from(chains);
    console.log("Chains in the protein:", chainList);

    return chainList
}

function save_pdb (viewer){

    const model = viewer.getModel();
    if (!model) {
        console.error("Error: No model found in the viewer.");
        return;
    }

    try {
        // Get the PDB string of the current model
        const pdbData = viewer.pdbData();

        // Create a Blob object to save the file
        const blob = new Blob([pdbData], { type: "text/plain" });

        console.log(blob)

        // Create a temporary download link
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "updated_structure.pdb"; // Specify the file name
        link.style.display = "none";

        // Append the link to the document, click it, and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("PDB file saved successfully.");
    } catch (error) {
        console.error("Error while saving PDB:", error);
    }

}


// Example: Filter atoms and update the viewer
function updateViewerWithFilteredAtoms(residueIdsToKeep, viewer) {

    console.log(viewer)
    // Retrieve the current model
    const model = viewer.getModel();
    if (!model) {
        console.error("No model exists in the viewer.");
        return;
    }

    // Get all atoms and filter them
    const allAtoms = model.selectedAtoms({});
    const filteredAtoms = allAtoms.filter(atom => residueIdsToKeep.includes(atom.resi));

    // Clear the model's atoms and add filtered atoms
    model.removeAtoms();
    model.addAtoms(filteredAtoms);

    // Clear existing styles and apply a new style
    viewer.setStyle({}, {}); // Clear all styles
    viewer.setStyle({}, { stick: {} }); // Apply stick style

    // Re-center and render the viewer
    viewer.zoomTo();
    viewer.render();
}


function Retrieve_residues(textdata) {
    const residues = {};

    let lines = textdata.split('\n');

    lines.forEach((line) => {
        if ( line.startsWith('HETATM')) {
            const residueName = line.slice(17, 20).trim();
            const residueNumber = line.slice(22, 26).trim();
            if (!residues[residueName]) {
                residues[residueName] = [];
            }

            if (!residues[residueName]) {
                residues[residueName] = [];
            }

            if (!residues[residueName].includes(residueNumber)) {
                // Add the residue number to the list of this residue
                residues[residueName].push(residueNumber);
            }
        }
    });
    return residues;
}

function createDropdown(residueData, viewer){
    const dropdownMenu = document.getElementById("dropdownMenu");

    const boundLigands  = document.createElement('div')
    boundLigands.className = 'ligands-dropdown'

   const ligandDropdownName = document.createElement('span')
   ligandDropdownName.textContent = "All ligands"

   boundLigands.append(ligandDropdownName)

    for (let r in Object.keys(residueData)){

        const Outer_Div = document.createElement('div')
        const drop_down = document.createElement('div')
        drop_down.className = 'residue-dropdown'
        drop_down.style.display = 'none'
        Outer_Div.className = 'residue-name'
        const name_label  = document.createElement('span')
        name_label.className = 'name'

        name_label.dataset.value = Object.keys(residueData)[r]
        name_label.textContent =  Object.keys(residueData)[r]

        const allResidueSelect = document.createElement('input')
        allResidueSelect.type = 'checkbox'
        allResidueSelect.className = 'all-residue-select'

       
        Outer_Div.append(name_label)
        Outer_Div.append(allResidueSelect)
        Outer_Div.append(drop_down)
      

        for (let n in residueData[Object.keys(residueData)[r]]){
            const Inner_span = document.createElement('span')
            Inner_span.className = 'residue-number'
            // Inner_span.textContent = residueData[Object.keys(residueData)[r]][n]

            const deleteIcon  = document.createElement("i")
            deleteIcon.className = "fas fa-trash"
            deleteIcon.textContent = ` Delete ${residueData[Object.keys(residueData)[r]][n]}`
            Inner_span.append(deleteIcon)

            const residueSelect = document.createElement('input')
            residueSelect.type = 'checkbox'
            residueSelect.className = 'residue-select'
            residueSelect.value = residueData[Object.keys(residueData)[r]][n]

            deleteResidue(deleteIcon, residueData[Object.keys(residueData)[r]][n], viewer)

            const InnerDiv  =  document.createElement('div')
            InnerDiv.className = 'inner-div'
            InnerDiv.append(Inner_span)
            InnerDiv.append(residueSelect)
            drop_down.append(InnerDiv)
        }

        boundLigands.append(Outer_Div)  
    }

    dropdownMenu.append(boundLigands)
}

function drop_down_collapse(){
    document.querySelectorAll('.name').forEach( (e)=>{
        e.addEventListener('click', (e)=>{
            if (e.target.parentElement.querySelector('.residue-dropdown').style.display !== 'block'){
                e.target.parentElement.querySelector('.residue-dropdown').style.display = 'block'
            } else{
                 e.target.parentElement.querySelector('.residue-dropdown').style.display = 'none'
            }
        })
    })
}

function clean_pdb(textdata){
    let clean_lines = []
    let lines = textdata.split('\n')

    lines.forEach((line, index) => {
        if (line.startsWith('ATOM') || line.startsWith('HETATM') || line.startsWith('TER')) {
            clean_lines.push(line)
            clean_lines.join('\n')
        } 
    });

    return clean_lines.join('\n')
  }

  function edit_text(text){
    edit.setValue('')
    edit.setValue(text)
  }

function saveChanges(viewer) {
    document.querySelector('#save-changes').addEventListener('click', ()=>{
        console.log(viewer)
        if (NewView){
            NewView.removeAllModels();
            NewView.addModel(editor.getValue(), "pdb");
            NewView.setStyle({ resn: "HOH", invert: true }, { cartoon: { color: 'spectrum' } }); 
            NewView.setStyle({ hetflag: true }, { stick: { colorscheme: 'greenCarbon' } });
            NewView.zoomTo(); 
            NewView.render(); 
        }else{
            viewer.removeAllModels();
            viewer.addModel(editor.getValue(), "pdb");
            viewer.setStyle({ resn: "HOH", invert: true }, { cartoon: { color: 'spectrum' } }); 
            viewer.setStyle({ hetflag: true }, { stick: { colorscheme: 'greenCarbon' } });
            viewer.zoomTo(); 
            viewer.render(); 
        }
    })
}

function loadPDBQuery() {

    document.querySelector('#pdb-query').addEventListener('click', ()=>{
        pdbId = document.querySelector('#pdb-query-input').value
        console.log(NewView)

        NewView.removeAllModels();
        NewView.addModel('', "pdb");

        LoadPdbToViewer('pdb', pdbId, NewView)
    })

    document.querySelector('#opm-query').addEventListener('click', ()=>{
        pdbId = document.querySelector('#opm-query-input').value
        console.log(NewView)

        NewView.removeAllModels();
        NewView.addModel('', "pdb");

        LoadPdbToViewer('opm', pdbId, NewView)
    })
}

function LoadPdbToViewer(database, pdbId, viewer){

    let url
    
    if (database === 'pdb'){
       url =  `https://files.rcsb.org/download/${pdbId}.pdb`;
    } else{
        url =  `https://opm-assets.storage.googleapis.com/pdb/${pdbId.toLowerCase()}.pdb`
    }

    const fetchProtein = async (url, pdbId, viewer) => {

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch PDB file for ${pdbId}`);
            }

            const pdbData = await response.text();
            const clean_pdbdata = clean_pdb(pdbData)


            viewer.addModel(clean_pdbdata, "pdb");
            const allAtoms  = viewer.getModel().selectedAtoms({});

            chain_drop_down( get_chains(allAtoms), viewer)
            Retrieve_residues(clean_pdbdata)
            createDropdown(Retrieve_residues(clean_pdbdata), viewer)
            drop_down_collapse()
            download_pdb(viewer)
            saveChanges(viewer)

            selectAllChain()
            selectAllResidues()
            deleteSelectedChain(viewer)
            deleteSelectedResidue(viewer)

            editor.setValue('');
            editor.setValue(viewer.pdbData())

            const residueIdsToExclude = [408, 409]; // Replace with your desired residue IDs
            const filteredAtoms = allAtoms.filter(atom => !residueIdsToExclude.includes(atom.resi));

            viewer.setStyle({ resn: "HOH", invert: true }, { cartoon: { color: 'spectrum' } }); 
            viewer.setStyle({ hetflag: true }, { stick: { colorscheme: 'greenCarbon' } });

            viewer.setStyle({ resn: "DUM", }, {sphere:{}});
            viewer.setStyle({ resn: "HOH", }, {sphere:{}});
            
            viewer.setClickable({}, true, function (atom, viewer, event, container) {
            const labelId = atom.resn + ":" + atom.resi+ ":" + atom.chain;
        
                if (viewer[labelId]) {
                    viewer.removeLabel(viewer[labelId]);
                    delete viewer[labelId]; // Clear the reference
                } else {
                    viewer[labelId] = viewer.addLabel(labelId, {
                        position: { x: atom.x, y: atom.y, z: atom.z },
                        backgroundColor: 'darkgreen',
                        backgroundOpacity: 0.8,
                        fontColor: 'white'
                    });
                }
            });

            viewer.zoomTo(); // Focus on the entire structure
            viewer.render(); // Render the scene

        } catch (error) {
            console.error("Error fetching protein data:", error);
        }
    };

    fetchProtein(url, pdbId,  NewView);
}

function selectAllChain() {

    document.querySelectorAll('.chain-Dropdown-Select').forEach((element)=>{
        element.addEventListener('click', (e)=>{
            e.target.parentElement.querySelectorAll('.chain-select').forEach((element)=>{
                element.checked = !element.checked;                
            })
        })
    })
}

function selectAllResidues() {
    document.querySelectorAll('.all-residue-select').forEach((element)=>{
        element.addEventListener('click', (e)=>{
            e.target.parentElement.querySelectorAll('.residue-select').forEach((element)=>{
                element.checked = !element.checked;                
            })
        })
    })
}

function deleteSelectedChain(viewer) {
    let chainList = {}
    document.querySelector('#delete-selected').addEventListener('click', ()=>{
        document.querySelector('.chain-dropdown').querySelectorAll('.chain-select').forEach((element)=>{
            if(element.checked){
                chainList[element.value] = element.parentElement
            }
        })

        console.log(chainList)

        if( Object.keys(chainList).length > 0){
            Object.keys(chainList).forEach((chain)=>{
                const allAtoms  = viewer.getModel().selectedAtoms({});
                const filteredAtoms = allAtoms.filter(atom => atom.chain !== chain);
                viewer.removeAllModels()
                const newModel = viewer.addModel();
                newModel.addAtoms(filteredAtoms );
                NewView = viewer
                NewView.zoomTo(); 
                NewView.render(); 
                chainList[chain].parentElement.remove()
                editor.setValue('');
                editor.setValue(viewer.pdbData())
            })
        }
    })
}



function deleteSelectedResidue(viewer) {

    const allAtoms  = viewer.getModel().selectedAtoms({});
    let  residueIdsToExclude = []

    document.querySelector('#delete-selected').addEventListener('click', ()=>{
        document.querySelector('.ligands-dropdown').querySelectorAll('.residue-select').forEach((element)=>{
            if(element.checked){
                residueIdsToExclude.push(parseInt(element.value))     
                element.parentElement.remove()
            }
        })
        const filteredAtoms = allAtoms.filter(atom => !residueIdsToExclude.includes(atom.resi))
     
        viewer.removeAllModels();
        const newModel = viewer.addModel();
        newModel.addAtoms(filteredAtoms );
        NewView = viewer
        NewView.zoomTo(); 
        NewView.render(); 

        editor.setValue('');
        editor.setValue(viewer.pdbData())
    })
}


function loadFile(){
    document.querySelector('#file-input').addEventListener('change', ()=>{

        console.log("Loaded")


    })
}