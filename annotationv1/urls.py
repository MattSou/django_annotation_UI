from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
]

urlpatterns+= [
    path('category/', views.CategoryListView.as_view(), name='categories'),
    path('category/<pk>', views.CategoryDetailView.as_view(), name='category-detail'),
]


urlpatterns += [
    path('category/create/', views.CategoryCreate.as_view(), name='category-create'),
    path('category/<pk>/update/', views.CategoryUpdate.as_view(), name='category-update'),
    path('category/<pk>/delete/', views.CategoryDelete.as_view(), name='category-delete'),
]

urlpatterns+= [
    path('example/', views.example, name = 'example'),
]

urlpatterns += [
    path('category/create-inside/', views.create_category, name='create-category-inside'),
    path('category/delete-inside/', views.delete_category, name='delete-category-inside'),
    # Ajoutez d'autres URLS selon vos besoins
]

urlpatterns += [
    path('fetch-models-data', views.fetch_models_data, name='fetch-models-data'),
    path('fetch-models-data-display', views.fetch_models_data_display, name='fetch-models-data-display'),
    # Ajoutez d'autres URLS selon vos besoins
]

urlpatterns +=[
    path('keyframe/update', views.update_keyframe, name='update-keyframe'),
    path('annotation/delete', views.delete_annotation, name='delete-annotation'),
]

urlpatterns +=[
    path('annotations-reset', views.reset_annotations, name='reset-annotations'),
]

urlpatterns +=[
    path('create-dataset', views.create_dataset, name='create-dataset'),
]