
async function funcName(url){
    const response = await fetch(url);
    var data = await response.json();
    return data
}

$.ajax({
    url: data_api+0,
    type: "GET",
    dataType: "json",
    cache: false
}).done(function(data) {

    var mol = Kekule.IO.loadFormatData(data['mol'], 'mol');

    var composer = Kekule.Widget.getWidgetById('composer');
    composer.setChemObj(mol);

    var view = Kekule.Widget.getWidgetById('chemViewer');
    view.setChemObj(mol);


    view.setRenderType(Kekule.Render.RendererType.R3D);
    view.setMoleculeDisplayType(Kekule.Render.Molecule3DDisplayType.STICKS);

}).fail(function(jqXHR, textStatus, errorThrown) {

    console.error("Error: " + textStatus, errorThrown);
});

var btn = document.querySelector('#chem_structure').querySelectorAll('button')

for (var i = 0; i < btn.length; i++){
        btn[i].id = i

        btn[i].addEventListener('click', async (e)=>{
            var data = await funcName(data_api+e.target.id)
            var mol = Kekule.IO.loadFormatData(data['mol'], 'mol');

            var composer = Kekule.Widget.getWidgetById('composer');
            composer.setChemObj(mol);

            var view = Kekule.Widget.getWidgetById('chemViewer');
            view.setChemObj(mol);
        
            view.setRenderType(Kekule.Render.RendererType.R3D);
            view.setMoleculeDisplayType(Kekule.Render.Molecule3DDisplayType.STICKS);
        })
}

var btr = document.querySelector('#rendering-stick')

btr.addEventListener('click', ()=>{

    var composer = Kekule.Widget.getWidgetById('composer');
    var mol = composer.getChemObj();

    var view = Kekule.Widget.getWidgetById('chemViewer');
    view.setChemObj(mol);

    view.setRenderType(Kekule.Render.RendererType.R3D);
    view.setMoleculeDisplayType(Kekule.Render.Molecule3DDisplayType.STICKS);
})


var BALL_STICK = document.querySelector('#rendering-ball_stick')

BALL_STICK.addEventListener('click', ()=>{

    var composer = Kekule.Widget.getWidgetById('composer');
    var mol = composer.getChemObj();

    var chemViewer = Kekule.Widget.getWidgetById('chemViewer');
    chemViewer.setChemObj(mol);

    chemViewer.setRenderType(Kekule.Render.RendererType.R3D);
    chemViewer.setMoleculeDisplayType(Kekule.Render.Molecule3DDisplayType.BALL_STICK);
})

var SPACE_FILL = document.querySelector('#rendering-space_fill')

SPACE_FILL.addEventListener('click', ()=>{

    var composer = Kekule.Widget.getWidgetById('composer');
    var mol = composer.getChemObj();

    var chemViewer = Kekule.Widget.getWidgetById('chemViewer');
    chemViewer.setChemObj(mol);

    chemViewer.setRenderType(Kekule.Render.RendererType.R3D);
    chemViewer.setMoleculeDisplayType(Kekule.Render.Molecule3DDisplayType.SPACE_FILL);
})

var s2D = document.querySelector('#tool-b-1')

s2D.addEventListener('click', ()=>{

    var composer = Kekule.Widget.getWidgetById('composer');
    var mol = composer.getChemObj();
    var cmlData1 = Kekule.IO.saveFormatData( mol, 'mol');
    var data1 = {'file':cmlData1}

    $.ajax({
        url: properties_api,
        type: "POST",
        dataType: "json",
        data: data1,
        cache: false
    }).done(function(data) {
        // Access the returned data here
        var mol = Kekule.IO.loadFormatData(data['mol'], 'mol');
        var view = Kekule.Widget.getWidgetById('chemViewer');
        view.setChemObj(mol);
    
        view.setRenderType(Kekule.Render.RendererType.R3D);
        view.setMoleculeDisplayType(Kekule.Render.Molecule3DDisplayType.STICKS);
        // Perform further actions with the data
    }).fail(function(jqXHR, textStatus, errorThrown) {
        // Handle error cases
        console.error("Error: " + textStatus, errorThrown);
    });
})

var pbc = document.querySelector('#pub-chem-form')
var btn = document.querySelector('.input-group').querySelector('button')

btn.addEventListener('click', () => {

    var pbc = document.querySelector('#pub-chem-form')
    var data1 = {'id': pbc.value}

    $.ajax({
        url: pubchem_api,
        type: "POST",
        dataType: "json",
        data: data1,
        cache: false
    }).done(function(data) {
        // Access the returned data here

        var mol = Kekule.IO.loadFormatData(data['mol'], 'mol');
        var view = Kekule.Widget.getWidgetById('chemViewer');
        view.setChemObj(mol);
    
        view.setRenderType(Kekule.Render.RendererType.R3D);
        view.setMoleculeDisplayType(Kekule.Render.Molecule3DDisplayType.STICKS);

        var composer = Kekule.Widget.getWidgetById('composer');
        composer.setChemObj(mol);

    }).fail(function(jqXHR, textStatus, errorThrown) {
        // Handle error cases
        console.error("Error: " + textStatus, errorThrown);
    });
})

var properties_button = document.querySelector('#rendering-Properties')

properties_button.addEventListener('click', ()=>{

    var composer = Kekule.Widget.getWidgetById('composer');
    var mol = composer.getChemObj();
    var cmlData1 = Kekule.IO.saveFormatData( mol, 'mol');
    var data1 = {'file':cmlData1}

    $.ajax({
        url: mol_properties,
        type: "POST",
        dataType: "json",
        data: data1,
        cache: false
    }).done(function(data) {

        document.querySelector("#mw").innerHTML = data['mw']
        document.querySelector("#lp").innerHTML = data['lp']
        document.querySelector("#NHA").innerHTML = data['NHA']
        document.querySelector("#NHD").innerHTML = data['NHD']

    }).fail(function(jqXHR, textStatus, errorThrown) {

        console.error("Error: " + textStatus, errorThrown);
    });
})

var Image2D = document.querySelector('#tool-b-2')

Image2D.addEventListener('click', ()=>{

    var composer = Kekule.Widget.getWidgetById('composer');
    var mol = composer.getChemObj();
    var cmlData1 = Kekule.IO.saveFormatData( mol, 'mol');
    var data1 = {'file':cmlData1}

    $.ajax({
        url: save_image,
        type: "POST",
        dataType: "json",
        data: data1,
        cache: false
    }).done(function(data) {


    }).fail(function(jqXHR, textStatus, errorThrown) {

        console.error("Error: " + textStatus, errorThrown);
    });
})


var u3dv = document.querySelector("#update-3d-view")

u3dv.addEventListener('click', ()=>{
    var composer = Kekule.Widget.getWidgetById('composer');
    var mol = composer.getChemObj();

    var view = Kekule.Widget.getWidgetById('chemViewer');
    view.setChemObj(mol);
})

var smtg = document.querySelector('#save-mol-to-galaxy')

smtg.addEventListener('click', ()=>{

    var composer = Kekule.Widget.getWidgetById('composer');
    var mol = composer.getChemObj();
    var cmlData1 = Kekule.IO.saveFormatData( mol, 'mol');

    console.log(cmlData1)
    var data = {'file':cmlData1}

    console.log(write_mol_file)

    $.ajax({
        url: write_mol_file,
        type: "POST",
        dataType: "json",
        data: data,
        cache: false
    }).done(function(data) {


    }).fail(function(jqXHR, textStatus, errorThrown) {

        console.error("Error: " + textStatus, errorThrown);
    });
})

var ext = document.querySelector('#exit-tool')

ext.addEventListener('click', ()=>{

    $.ajax({
        url: closs_server,
        cache: false
    }).done(function(data) {

    })
})


document.querySelector('#protein-viewer-button').addEventListener('click', ()=>{
    window.open('http://127.0.0.1:8000/protein_viewer', '_blank'); 

    document.querySelector('#protein-viewer-button-list').style.display = 'block'

    console.log("OK")


})


// var protein_button = document.querySelector('#protein-Viewer').addEventListener('click', ()=>{

//     console.log("OK")

//     // window.open("{% url 'protein_viewer' %}", "_blank");
// })