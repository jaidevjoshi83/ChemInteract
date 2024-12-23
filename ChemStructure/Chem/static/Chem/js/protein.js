document.addEventListener('DOMContentLoaded', function () {
    let element = document.querySelector('#container-01');
    if (element) {
        let config = { backgroundColor: 'white' };
        let viewer = $3Dmol.createViewer(element, config);

        // Function to fetch protein data from PDB
        const fetchProtein = async (pdbId) => {
            try {
                const url = `https://files.rcsb.org/download/${pdbId}.pdb`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Failed to fetch PDB file for ${pdbId}`);
                }

                const pdbData = await response.text();
                const clean_pdbdata = clean_pdb(pdbData)


                viewer.addModel(clean_pdbdata, "pdb");
                const allAtoms  = viewer.getModel().selectedAtoms({});

              
                Retrieve_residues(clean_pdbdata)
                createDropdown(Retrieve_residues(clean_pdbdata), viewer)
                drop_down_collapse()
                chain_drop_down( get_chains(allAtoms), viewer)

                const residueIdsToExclude = [408, 409]; // Replace with your desired residue IDs
                const filteredAtoms = allAtoms.filter(atom => !residueIdsToExclude.includes(atom.resi));

                viewer.setStyle({ resn: "HOH", invert: true }, { cartoon: { color: 'spectrum' } }); 
                viewer.setStyle({ hetflag: true }, { stick: { colorscheme: 'greenCarbon' } });

                document.querySelector('#delete-res').addEventListener('click', ()=>{
                    viewer.removeAllModels();
                    const newModel = viewer.addModel();
                    newModel.addAtoms(filteredAtoms );
                    viewer.zoomTo(); 
                    viewer.render(); 

                    save_pdb(viewer)
                })

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

            } catch (error) {
                console.error("Error fetching protein data:", error);
            }
        };

        fetchProtein("2RH1");
    } else {
        console.error('Element with ID "container-01" not found.');
    }
});


function chain_drop_down(chainList, viewer){

   const mainDropdown = document.querySelector("#dropdownMenu")
   const chains =  document.createElement('div')
   chains.className = "chain-dropdown"

   const chainDropdownName = document.createElement('span')
   chainDropdownName.textContent = "All Chains"

   const allChainsDiv = document.createElement('div')
   allChainsDiv.className  = 'all-chains-div'
   allChainsDiv.style.display = 'block'

   chains.append(chainDropdownName)
 
    chainList.forEach(chain =>{

        const chainElement  = document.createElement('div')
        chainElement.className = "chain-element"

        const chainName = document.createElement('span')
        chainName.className = 'chain-name'
        chainName.dataset.value = chain;

        const icon  = document.createElement("i")
        icon.className = "fas fa-trash"
        icon.textContent = `Chain ${chain}`
        chainName.append(icon)

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
        viewer.removeAllModels();
        const newModel = viewer.addModel();
        newModel.addAtoms(filteredAtoms );
        viewer.zoomTo(); 
        viewer.render(); 
    })
}

function deleteResidue(element, res_id, viewer) {
    const residueIdsToExclude =[parseInt(res_id)]
    element.addEventListener('click', ()=>{
        console.log("OK", res_id)
        const allAtoms  = viewer.getModel().selectedAtoms({});
        const filteredAtoms = allAtoms.filter(atom => !residueIdsToExclude.includes(atom.resi));
        console.log(filteredAtoms)
        viewer.removeAllModels();
        const newModel = viewer.addModel();
        newModel.addAtoms(filteredAtoms );
        viewer.zoomTo(); 
        viewer.render(); 
    })
}


function get_chains(allAtoms) {
    let chains = new Set(); // Use a set to ensure uniqueness
    
    allAtoms.forEach(atom => {
        if (atom.chain) {
            chains.add(atom.chain); // Add chain identifiers to the set
        }
    });
    
    // Convert the set to an array for further use
    let chainList = Array.from(chains);
    console.log("Chains in the protein:", chainList);

    return chainList


}

function save_pdb (viewer){

    // console.log(viewer.pdbData())
    // Retrieve the current model
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

        Outer_Div.append(name_label)
        Outer_Div.append(drop_down)

        for (let n in residueData[Object.keys(residueData)[r]]){
            const Inner_span = document.createElement('span')
            Inner_span.className = 'residue-number'
            // Inner_span.textContent = residueData[Object.keys(residueData)[r]][n]

            const deleteIcon  = document.createElement("i")
            deleteIcon.className = "fas fa-trash"
            deleteIcon.textContent = ` Delete ${residueData[Object.keys(residueData)[r]][n]}`
            Inner_span.append(deleteIcon)

            deleteResidue(deleteIcon, residueData[Object.keys(residueData)[r]][n], viewer)

            const InnerDiv  =  document.createElement('div')
            InnerDiv.className = 'inner-div'
            InnerDiv.append(Inner_span)
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

