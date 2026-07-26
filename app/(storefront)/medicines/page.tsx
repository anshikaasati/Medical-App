import { redirect } from 'next/navigation';

// /medicines → redirect to the actual shop catalog
export default function MedicinesPage() {
  redirect('/shop');
}
