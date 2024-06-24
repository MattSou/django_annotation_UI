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
import os
from django.conf import settings
import subprocess
from django.db.models import Q



def index(request):
    list_video = list(Video.objects.values())
    if len(list_video)==0:
        list_kf = list(Keyframe.objects.all().values())
    else:
        list_kf = list(Keyframe.objects.filter(video_id=list_video[0]['code']).values())
    
    
    annotations = list(Keyframe.category.through.objects.filter(keyframe_id__in=[kf['path'] for kf in list_kf]).values())
    #annotations = list(Keyframe.category.through.objects.values())

    context = {
        'annotations': annotations,
        'category': list(Category.objects.values()),
        'keyFrame': list_kf,
        'video' : list_video,
        
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

def fetch_models_data_display2(request):
    data = request.POST
    exploreVideo = data.get('exploreVideo')
    annotationVideo = data.get('annotationVideo')
    exploreCategories = data.get('exploreCategories')
    currentCategories = list(Category.objects.values())
    currentCategories = [cat['name'] for cat in currentCategories]
    kf_list = []
    
    if exploreCategories is not None:
        query = Q()
        for category in exploreCategories:
            query |= Q(category_id=category)
        kf_list_for_query = list(Keyframe.category.through.objects.filter(query).values())
        kf_query = Q()
        for kf in kf_list_for_query:
            kf_query |= Q(pk=kf['keyframe_id'])
        kf_list += list(Keyframe.objects.filter(kf_query).values())

    else :
        dataset = exploreVideo.split('/')[0]
        path = os.path.join(settings.MEDIA_URL, dataset, exploreVideo)
        kf_list_path = os.listdir(path)
        for kf in kf_list_path:
            kf_list.append(create_keyframe_dump(dataset, exploreVideo, kf, currentCategories))
        #kf_list += list(Keyframe.objects.filter(video_id=exploreVideo).values())
        if annotationVideo!=exploreVideo:
            path = os.path.join(settings.MEDIA_URL, dataset, annotationVideo)
            kf_list_path = os.listdir(path)
            for kf in kf_list_path:
                kf_list.append(create_keyframe_dump(dataset, annotationVideo, kf, currentCategories))
         #   kf_list += list(Keyframe.objects.filter(video_id=annotationVideo).values())

    annotations = list(Keyframe.category.through.objects.filter(keyframe_id__in=[kf['path'] for kf in kf_list]).values())

    context = {
        'annotations': annotations,
        'category': list(Category.objects.values()),
        'keyFrame': kf_list,
        'video' : list(Video.objects.values()),
        
    }
    return JsonResponse({'modelsData': context, 'data': [exploreVideo, annotationVideo, exploreCategories]})

def fetch_models_data_display(request):
    data = request.POST
    exploreVideo = data.get('exploreVideo')
    annotationVideo = data.get('annotationVideo')
    exploreCategories = data.get('exploreCategories')
    currentCategories = list(Category.objects.values())
    currentCategories = [cat['name'] for cat in currentCategories]
    kf_list = []
    print(type(exploreCategories), exploreCategories)

    if exploreCategories !='':
        print('yes')
        exploreCategories = exploreCategories.split(',')
        query = Q()
        for category in exploreCategories:
            query |= Q(category_id=category)
        kf_list_for_query = list(Keyframe.category.through.objects.filter(query).values())
        kf_query = Q()
        for kf in kf_list_for_query:
            kf_query |= Q(pk=kf['keyframe_id'])
        kf_query &= Q(video_id=exploreVideo)
        kf_list += list(Keyframe.objects.filter(kf_query).values())
        
    else:
        #for kf in list(Keyframe.objects.values()):
            #print(kf['video_id'], exploreVideo, kf['video_id'] == exploreVideo)
        kf_list += list(Keyframe.objects.filter(video_id=exploreVideo).values())
        if annotationVideo!=exploreVideo:
            kf_list += list(Keyframe.objects.filter(video_id=annotationVideo).values())

    annotations = list(Keyframe.category.through.objects.filter(keyframe_id__in=[kf['path'] for kf in kf_list]).values())
    #print(f"exploreVideo : {exploreVideo}")
    #print(f"annotationVideo : {annotationVideo}")
    #print(f"kf_example : {kf_list[0]}")
    

    context = {
        'annotations': annotations,
        'category': list(Category.objects.values()),
        'keyFrame': kf_list,
        'video' : list(Video.objects.values()),
        
    }
    return JsonResponse({'modelsData': context, 'data': [exploreVideo, annotationVideo, exploreCategories]})


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


def checkVideoAnnotated(video, category):
    keyframes = Keyframe.objects.filter(video_id=video)
    annotated = True
    for keyframe in keyframes:
        if not keyframe.annotated[category]:
            annotated = False
            break
    video = Video.objects.get(pk=video)
    video.annotated[category] = annotated
    video.save()
    return annotated


@csrf_exempt
def update_keyframe(request):
    if request.method == 'POST':
        data = request.POST.get('body')
        data = json.loads(data)
        video = Keyframe.objects.get(pk=data[0]['keyframe_id']).video_id
        category = request.POST.get('currentCategory')
        for item in data:
            id = item['keyframe_id']#.replace('./Datasets/', '')
            if 'category_id' in item:
                model = Keyframe.objects.get(pk=id)
                model.category.add(item['category_id'])
            if 'annotated' in item:
                model = Keyframe.objects.get(pk=id)
                model.annotated.update(item['annotated'])
            model.save()
        checkVideoAnnotated(video, category)
        return JsonResponse({'message': 'Instance mise à jour avec succès !', 'data': data})
    else:
        return JsonResponse({'error': 'Méthode non autorisée', 'method':request.method, 'data': str(request.body)}, status=405)


@csrf_exempt
def delete_annotation(request):
    if request.method == 'POST':
        data = request.POST
        keyframe_id = data.get('keyframe_id')#.replace('./Datasets/', '')
        category = data.get('category')
        print(Keyframe.category.through.objects.filter(keyframe_id=keyframe_id, category_id=category))
        Keyframe.category.through.objects.filter(keyframe_id=keyframe_id, category_id=category).delete()
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
    print(ann_dic)
    return JsonResponse({'message': 'Annotations réinitialisées avec succès !'})



def create_timecode(name):
    tmp = name.split('_')[-2:]
    sec, f = int(tmp[0].replace('s','')), tmp[1].replace('f','')
    h = sec//3600
    m = (sec%3600)//60
    s = (sec%3600)%60
    sec = ':'.join([('0'+str(h))[-2:], ('0'+str(m))[-2:], ('0'+str(s))[-2:]])
    return '.'.join([sec,f])


def create_video_dump(dataset, video):
    """
    Creates a json dump template for creating a video
    ------------
    Parameters :
    - video : str in [channel_code]_YYYYMMDDThhmmss format
    """

    return {
        "model": "annotationv1.video",
        "pk": os.path.join(dataset, video),
        "fields": {
            "name": video
        }
    }

def create_keyframe_dump(dataset, video, keyframe, categories):
    """
    Creates a json dump template for creating a keyframe
    ------------
    Parameters :
    - keyframe : str in [channel_code]_YYYYMMDDThhmmss_s[n_second]_f[n_frame].jpg format
    - categories : list of str in [category_name] format of exisitng categories in the database
    """
    keyframe = keyframe.split('.')[0]
    video = keyframe.split('_s')[0]
    return {
        "model": "annotationv1.keyframe",
        "pk": os.path.join(dataset, video, keyframe+".jpg"),
        "fields": {
            "video": os.path.join(dataset, video),
            "name": keyframe,
            "timecode": create_timecode(keyframe),
            "category": [],
            "annotated": {category: False for category in categories}
        }
    }




@csrf_exempt
def create_dataset(request):
    if request.method == 'POST':
        existing_videos = Video.objects.all().values_list('name', flat=True)
        data = request.POST
        dataset = data.get('name')
        categories = data['currentCategories']
        if categories!= '':
            categories = categories.split(',')
        else:
            categories = []
        update_dump = []
        path = os.path.join(settings.MEDIA_URL, dataset)
        list_videos = os.listdir(path)#[:2]
        for i,video in enumerate(list_videos):
            print(f"{video} - n°{i}/{len(list_videos)}")
            if video in existing_videos:
                continue
            update_dump.append(create_video_dump(dataset, video))
            path_video = os.path.join(path, video)
            list_keyframes = os.listdir(path_video)
            for keyframe in list_keyframes:
                update_dump.append(create_keyframe_dump(dataset, video, keyframe, categories))
            
    
        with open("./data.json", "w") as file:
            json.dump(update_dump, file)
        
        subprocess.call(["python", "manage.py", "loaddata", "data.json"])
        return JsonResponse({'message': 'Dataset créé avec succès !', 'data': data['currentCategories']})
    else:
        return JsonResponse({'error': 'Méthode non autorisée', 'method':request.method, 'data': str(request.body)}, status=405)











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
