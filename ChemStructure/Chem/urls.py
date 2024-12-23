from django.urls import path
from . import views

urlpatterns = [
    path(r'', views.ints, name='ints'),
    path(r'write_mol_file', views.write_mol_file, name="write_mol_file"),
    path(r'close_server', views.close_server, name="close_server"),
    # path(r'load_chem', views.load_chem, name="load_chem"),
    path(r'load_chem', views.load_chem, name='load_chem'),
    path(r'properties', views.properties, name="properties"),
    path(r'return_properties', views.return_properties, name="return_properties"),
    path(r'fetch_pub_chem', views.fetch_pub_chem, name="fetch_pub_chem"),
    path(r'mol_properties', views.mol_properties, name="mol_properties"),
    path(r'save_image', views.save_image, name="save_image"),
    path(r'protein_viewer', views.protein_viewer, name='protein_viewer')  
]