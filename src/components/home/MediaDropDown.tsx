import {  useRef, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ImageIcon, Plus, Video } from "lucide-react";
import MediaImageDialog from "./MediaImageDialog";
import MediaVideoDialog from "./MediaVideoDialog";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useConversationStore } from "@/store/chatStore";

const MediaDropdown = () => {
	const imageInput = useRef<HTMLInputElement>(null);
	const videoInput = useRef<HTMLInputElement>(null);
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

	const [isLoading, setIsLoading] = useState(false);

	const generateUploadUrl = useMutation(api.conversations.generateUploadUrl);
	const sendImage = useMutation(api.messages.sendImage);
	const sendVideo = useMutation(api.messages.sendVideo);
	const me = useQuery(api.users.getMe);

	const { selectedConversation } = useConversationStore();

	const handleSendImage = async () => {
		setIsLoading(true);
		try {
			// Step 1: Get a short-lived upload URL
			const postUrl = await generateUploadUrl();
			// Step 2: POST the file to the URL
			const result = await fetch(postUrl, {
				method: "POST",
				headers: { "Content-Type": selectedImage!.type },
				body: selectedImage,
			});

			const { storageId } = await result.json();
			// Step 3: Save the newly allocated storage id to the database
			await sendImage({
				conversation: selectedConversation!._id,
				imgId: storageId,
				sender: me!._id,
			});

			setSelectedImage(null);
		} catch (err) {
			toast.error("Failed to send image");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSendVideo = async () => {
		setIsLoading(true);
		try {
			const postUrl = await generateUploadUrl();
			const result = await fetch(postUrl, {
				method: "POST",
				headers: { "Content-Type": selectedVideo!.type },
				body: selectedVideo,
			});

			const { storageId } = await result.json();

			await sendVideo({
				videoId: storageId,
				conversation: selectedConversation!._id,
				sender: me!._id,
			});

			setSelectedVideo(null);
		} catch (error) {
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<input
				type='file'
				ref={imageInput}
				accept='image/*'
				onChange={(e) => setSelectedImage(e.target.files![0])}
				hidden
			/>

			<input
				type='file'
				ref={videoInput}
				accept='video/mp4'
				onChange={(e) => setSelectedVideo(e.target?.files![0])}
				hidden
			/>

			{selectedImage && (
				<MediaImageDialog
					isOpen={selectedImage !== null}
					onClose={() => setSelectedImage(null)}
					selectedImage={selectedImage}
					isLoading={isLoading}
					handleSendImage={handleSendImage}
				/>
			)}

			{selectedVideo && (
				<MediaVideoDialog
					isOpen={selectedVideo !== null}
					onClose={() => setSelectedVideo(null)}
					selectedVideo={selectedVideo}
					isLoading={isLoading}
					handleSendVideo={handleSendVideo}
				/>
			)}

			<DropdownMenu>
				<DropdownMenuTrigger>
					<Plus className='text-gray-600 dark:text-gray-400' />
				</DropdownMenuTrigger>

				<DropdownMenuContent>
					<DropdownMenuItem onClick={() => imageInput.current!.click()}>
						<ImageIcon size={18} className='mr-1' /> Photo
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => videoInput.current!.click()}>
						<Video size={20} className='mr-1' />
						Video
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};
export default MediaDropdown;


