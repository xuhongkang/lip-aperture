# Lip-Aperture

## Description:
Utilizes existing software such as Snapchat’s Snap AR Snap Camera and Lens Builder to create a Video Conferencing Plugin using AR filters to enhance university ESL pronunciation training. Annotates face landmarks around lip area and detects tongue appearence to assist teaching. 

## Snap Camera
Snap Camera is a free desktop platform that integrates thousands of lenses, including classics from Snapchat and fresh designs from lens creators* with popular streaming and video conferencing platforms, such as Zoom and Twitch. Since these platforms are not application scenarios of complex education-assisting AR filters, Snap Camera can bridge this gap by granting access to custom lenses. Snap Camera provides a plug-in, a virtual camera which enables us to apply any filter. Using Lens Builder, also made under Snap AR by Snapchat, we can create, publish and share tailored AR filters that can then be utilized via Snap Camera and displayed real-time on Zoom.

After installing the software, right-click the icon and choose the “run as administrator” option. Find the custom “Face Landmarks” filter in the Snap Camera Workshop, either via keywords or through inserting the Lens ID in the search bar. Double click on the target lens to load it to Snap Camera. Back in the video conferencing app, open the camera with the option “virtual camera” and ensure that your face is positioned vertically in the center of the zoomed camera.
    
Lenses were designed to apply two major features: The implementation of an AR filter, as well as annotations for lip aperture. 8 points were displayed anchored to static points spanning the oral commissures, cupids bow and various other middle points along the vermillion border. 

4 points apart from the absolute corners and tips of the lips were labelled red, while the middle points were labelled yellow, to provide better visual feedback from potential camera side angles. In video conferencing, it may be difficult for all students to directly face the camera at an equal horizontal level and maintain that stance for the entire session. Instructors may also find it useful to examine students at different angles, considering the gradual differences in lip anatomy between each subject. At side angles, labelled points involuntarily merge, making it difficult for the instructor to differentiate. Thus, corners of the mouth are labelled red and the others yellow, which significantly facilitates the identification of lip aperture.

A single, mono-colored, opaque 3d face-mesh covers the entirety of the face to improve teaching efficiency. This feature was introduced with the notion that taking away distracting and non-course related facial attributes could enhance student performance. However, eye-contact, and other types of non-verbal communication still strongly influence virtual education.  AR filters allow for the satisfaction of both objectives, retaining eye contact and dynamic facial movement, while filtering individual differences in facial characteristics.

Upon mouth movement, the AR filter detects tongue appearance and informs the instructor by displaying a bright colored dot anchored in its place. The opacity of the dot is decided by the distance between face landmarks on the upper and lower lip.





* What is Snap Camera? Snap Camera FAQ, https://support.snapchat.com/en-US/article/snap-camera-faq
