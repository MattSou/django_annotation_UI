from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseRedirect

from .models import Keyframe, Category, Video
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.urls import reverse
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from django.core.serializers import serialize


def index(request):
    context = {
        'annotations': list(Keyframe.category.through.objects.values()),
        'category': list(Category.objects.values()),
        'keyFrame': list(Keyframe.objects.values()),
        'video' : list(Video.objects.values()),
        
    }
    context = json.dumps(context)
    context = {'modelsData': context}
    # Render the HTML template index.html with the data in the context variable
    return render(request, 'index.html', context=context)


def example(request):
    context = {

    }

    return render(request, 'ex_imbrication.html', context = {'modelsData': context})


from django.views import generic

@csrf_exempt
def create_category(request):
    
    
    if request.method == 'POST':
        data = request.POST
        name = data.get('name')
        description = data.get('description')
        new_cat = Category(name=name, description=description)
        new_cat.save()
        for keyframe in Keyframe.objects.all():
            ann_dic = keyframe.annotated
            ann_dic[name] = False
            keyframe.annotated = ann_dic
            keyframe.save()
        return JsonResponse({'message': 'Instance créée avec succès !'})
    else:
        return JsonResponse({'error': 'Méthode non autorisée', 'method':request.method, 'data': str(request.body)}, status=405)


def fetch_models_data(request):
    context = {
        'annotations': list(Keyframe.category.through.objects.values()),
        'category': list(Category.objects.values()),
        'keyFrame': list(Keyframe.objects.values()),
        'video' : list(Video.objects.values()),
        
    }
    return JsonResponse({'modelsData': context})


@csrf_exempt
def delete_category(request):
    
    
    if request.method == 'POST':
        data = request.POST
        name = data.get('name')
        Category.objects.filter(name=name).delete()
        for keyframe in Keyframe.objects.all():
            ann_dic = keyframe.annotated
            ann_dic.pop(name, None)
            keyframe.annotated = ann_dic
            keyframe.save()
        return JsonResponse({'message': 'Instance créée avec succès !'})
    else:
        return JsonResponse({'error': 'Méthode non autorisée', 'method':request.method, 'data': str(request.body)}, status=405)
    
@csrf_exempt
def update_keyframe(request):
    if request.method == 'POST':
        data = request.POST.get('body')
        data = json.loads(data)
        for item in data:
            if 'category' in item:
                model = Keyframe.objects.get(pk=item['keyframe_id'])
                model.category.add(item['category'])
            if 'annotated' in item:
                model = Keyframe.objects.get(pk=item['keyframe_id'])
                model.annotated.update(item['annotated'])
            model.save()
        return JsonResponse({'message': 'Instance mise à jour avec succès !', 'data': data})
    else:
        return JsonResponse({'error': 'Méthode non autorisée', 'method':request.method, 'data': str(request.body)}, status=405)

@csrf_exempt
def reset_annotations(request):
    ann_dic = Keyframe().annotated
    annotations = Keyframe.category.through.objects.all()
    for annotation in annotations:
        annotation.delete()
    Keyframe.objects.all().update(annotated=ann_dic)
    return JsonResponse({'message': 'Annotations réinitialisées avec succès !'})

class CategoryDetailView(generic.DetailView):
    """Generic class-based detail view for a book."""
    model = Category

class CategoryListView(generic.ListView):
    """Generic class-based detail view for a book."""
    model = Category


class CategoryCreate(CreateView):
    model = Category
    fields = ['name', 'description']
    initial = {'name': 'Blur'}

class CategoryUpdate( UpdateView):
    model = Category
    # Not recommended (potential security issue if more fields added)
    fields = '__all__'

class CategoryDelete(DeleteView):
    model = Category
    success_url = reverse_lazy('Categorys')

    def form_valid(self, form):
        try:
            self.object.delete()
            return HttpResponseRedirect(self.success_url)
        except Exception as e:
            return HttpResponseRedirect(
                reverse("Category-delete", kwargs={"pk": self.object.pk})
            )


class KeyframeCreate(CreateView):
    model = Keyframe
    fields = ['path', 'display_category']
