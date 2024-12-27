from django.shortcuts import render
# Create your views here.
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
import signal
from django.conf import settings

from rdkit import Chem
from rdkit.Chem import Draw
from rdkit.Chem import AllChem
from rdkit.Chem import Descriptors
from rdkit.Chem import SDWriter
import requests
import json
from .utils import SDF_reader, GetSDFProperties
import base64

data = SDF_reader(os.path.join(settings.STATIC_ROOT, 'Chem', 'data', 'data.sdf'))

def ints(request):
    return render(request, 'Chem/index.html', {'data':'', 'mols':list(data.keys()), 'host':request.get_host()})

def properties(request):
    return render(request, 'Chem/table-export.html', {})

@csrf_exempt
def write_mol_file(request):  
    if request.method == "POST":
        form = request.POST
        if form:
            out_file_path = os.path.join(settings.STATIC_ROOT, 'Chem', 'out', 'mol')
            out_file_png = os.path.join(settings.STATIC_ROOT, 'Chem', 'out', 'image')

            print(form.dict()['file'])


            mol = Chem.MolFromMolBlock(form.dict()['file'])
            writer = SDWriter(out_file_path+'/molecule.sdf')
            writer.write(mol)
            writer.close()

            img = Draw.MolToImage(mol, size=(400, 400))
            png_file_path = os.path.join(out_file_png, 'mol.png')
            img.save(png_file_path)

            return JsonResponse(form.dict(), status=201)
        return JsonResponse('error', status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def close_server(request):
    os.kill(os.getpid(), signal.SIGINT)


@csrf_exempt
def load_chem(request):
    id = request.GET.get('id')
    data = SDF_reader(os.path.join(settings.STATIC_ROOT,  'Chem', 'data', 'data.sdf'))
    properties = GetSDFProperties(data[int(id)])
    return JsonResponse({'mol':"".join(data[int(id)]), "properties":properties}, status=201)


@csrf_exempt
def return_properties(request):
    if request.method == "POST":
        form = request.POST
        if form:     
            mol = Chem.MolFromMolBlock(form.dict()['file'])
           
            # img = Draw.MolToImage(mol)
            # img.save('3d_structure.png')
            # Draw.MolToImageFile(mol, '3d.png')
            AllChem.EmbedMolecule(mol)
            AllChem.MMFFOptimizeMolecule(mol)

            return JsonResponse({'mol': Chem.MolToMolBlock(mol)}, status=201)
        return JsonResponse('error', status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def fetch_pub_chem(request):
    if request.method == "POST":
        form = request.POST
        if form:   
            print(form.dict()['id']) 
            url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{form.dict()['id']}/record/SDF/?record_type=3d"
            response = requests.get(url)

            if response.status_code == 200:
                sdf_data = response.text

                return JsonResponse({'mol': sdf_data}, status=201)
        return JsonResponse('error', status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def mol_properties(request):
    if request.method == "POST":
        form = request.POST
        if form:     
   
            mol = Chem.MolFromMolBlock(form.dict()['file'])

            properties = {
                "mw": round(Descriptors.MolWt(mol),3),
                "lp": round(Descriptors.MolLogP(mol), 3),       
                "NHA": Descriptors.NumHAcceptors(mol),           
                "NHD": Descriptors.NumHDonors(mol)  
            }

            return JsonResponse(properties, status=201)
        return JsonResponse('error', status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def save_image(request):
    if request.method == "POST":
        form = request.POST
        if form:     
            mol = Chem.MolFromMolBlock(form.dict()['file'])
            image = Draw.MolToImage(mol)
            image.save(os.path.join(settings.STATIC_ROOT,'Chem', 'out', 'image' '/mol.png'))
            return JsonResponse({}, status=201)
        return JsonResponse('error', status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


def protein_viewer(request):
    return render(request, 'Chem/protein.html', {})


def download_protein_structure(request):
    return render(request, 'Chem/protein.html', {})

@csrf_exempt  # Disable CSRF for the API (use with caution, or implement CSRF protection)
def  write_pdb_file(request):

    print("lele")
    if request.method == 'POST':
        try:
            json_data = json.loads(request.body)
            pdb_base64 = json_data.get('pdb_data')

            if pdb_base64:
 
                pdb_bytes = base64.b64decode(pdb_base64)
                out_file_path = os.path.join(settings.STATIC_ROOT, 'Chem', 'out', 'protein','Newuploaded.pdb')
                with open(out_file_path, 'wb') as f:
                    f.write(pdb_bytes)

                return JsonResponse({'message': 'PDB file uploaded successfully'}, status=200)

            return JsonResponse({'error': 'No PDB data provided'}, status=400)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid method'}, status=405)
def test(request):
    return render(request, 'Chem/test.html', {})
