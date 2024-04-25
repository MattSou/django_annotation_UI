from django.contrib import admin

from .models import Keyframe, Category, Video

admin.autodiscover()

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Administration object for Category models.
    """
    list_display = ('name', 'description', 'display_keyframe')
    fields = ['name', ('description')]

@admin.register(Keyframe)
class KeyframeAdmin(admin.ModelAdmin):
    """Administration object for KeyFrame models.
    """
    list_display = ('path', 'display_category', 'display_annotated')
    #fields = ['path']

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    """Administration object for Video models.
    """
    list_display = ('code', 'name', 'display_keyframe')