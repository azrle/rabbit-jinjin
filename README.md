RABBIT ##
=========

Introduction
---------------

First of all, since most of technical reports for projects I have been involved are hardly able to be written down in a single or two pages, this small project has been chosen. Hope you could enjoy it.

This project was made for my girlfriend as a gift in Valentine’s Day, 2011. Although it is simple and crude, my love and sincerity it reflects made her touched.

In this project, it will create a rabbit with HTML5 canvas without any image. The rabbit is able to blink, jump and changing her emotion. And she is flexible which makes her more real.

Technical Overview
--------------------

1. Physics simulation

I luckily found a simple <a href="http://dev.opera.com/articles/view/blob-sallad-canvas-tag-and-javascrip/">demonstration</a> to show how to achieve the physics simulation system, and the remaining works are largely depend on it. 

The keys to physic system are Verlet Integration and joint (which makes rabbit flexible). 

2. Rabbit body

There are 12 points in total to create the whole body. And each curve including face, ears is made by Bezier Curve with those points.

3. Rabbit face (emotions)

The eye is made of three circles (1 black and 2 white smaller ones). And to make it blink, we periodically draw a line as an eye. 

The blusher is made of two pink ovals and a month is simply an arc; however it might change due to the current emotion of the rabbit.

4. Rabbit action

The first action of the rabbit is emotion changing. If you do not play with her, she will turn unhappy and try to look pitiable.

The other action is jumping which is triggered randomly by an upward force.
