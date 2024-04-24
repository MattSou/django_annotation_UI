from django.db import models

from django.urls import reverse


class Category(models.Model):
    name = models.CharField(unique=True, max_length=100, primary_key=True)
    description = models.TextField()

    def display_keyframe(self):
        """Creates a string for the Genre. This is required to display genre in Admin."""
        return ', '.join([keyframe.name for keyframe in self.keyframe_set.all()])


    def __str__(self):
        """String for representing the Model object."""
        return self.name

    def get_absolute_url(self):
        """Returns the URL to access a detail record for this book."""
        return reverse('category-detail', args=[str(self.id)])

def default_annotated():
    return {cat : False for cat in list(Category.objects.values_list('name', flat=True))}

class Keyframe(models.Model):

    path = models.CharField(unique=True, help_text='local_path', max_length=200, primary_key=True)

    category = models.ManyToManyField(Category, blank=True)

    video = models.ForeignKey('Video', models.SET_NULL, null=True)

    name = models.CharField(max_length=200, help_text='channel_YYYYMMDDThhmmss_s(n_seconds)_f(n-frame) format', null=True)

    timecode = models.CharField(max_length=200, help_text='hh:mm:ss.f format', null=True)

    annotated = models.JSONField(default=default_annotated, null=True)

    def display_category(self):
        """Creates a string for the Genre. This is required to display genre in Admin."""
        return ', '.join([category.name for category in self.category.all()])
    

    display_category.short_description = 'Category'

    def display_annotated(self):
        """Creates a string for the Genre. This is required to display genre in Admin."""
        return ', '.join([category +f' : {self.annotated[category]}' for category in self.annotated.keys()])
    

    display_annotated.short_description = 'Annotation status'

    def __str__(self):
        """String for representing the Model object."""
        name = self.path.split('/')[-1]
        return name

    def get_absolute_url(self):
        """Returns the URL to access a detail record for this book."""
        return reverse('keyframe', args=[str(self.id)])    


class Video(models.Model):

    code = models.CharField(unique=True, help_text='local_folder_path', max_length=300, primary_key=True)

    name = models.CharField(max_length=200, help_text='channel_YYYYMMDDThhmmss format', null=True)

    def display_keyframe(self):
        """Creates a string for the Genre. This is required to display genre in Admin."""
        return ', '.join([keyframe.name for keyframe in self.keyframe_set.all()[:3]])
    

    display_keyframe.short_description = 'Keyframes'

    def __str__(self):
        """String for representing the Model object."""
        name = self.name
        return name

    def get_absolute_url(self):
        """Returns the URL to access a detail record for this book."""
        return reverse('video', args=[str(self.id)])  
